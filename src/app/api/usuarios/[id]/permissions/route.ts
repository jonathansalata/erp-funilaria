import { NextResponse } from "next/server";

import { getUsuariosPermissions } from "@/lib/auth/server-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { MODULE_KEYS, PERMISSION_ACTIONS, type PermissionMatrix } from "@/lib/mock-data/users";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("view")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("user_permission_overrides")
    .select("allowed, permission:permissions(module, action)")
    .eq("user_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const overrides = (data ?? [])
    .filter((row) => row.permission)
    .map((row) => ({
      module: row.permission!.module,
      action: row.permission!.action,
      allowed: row.allowed,
    }));

  return NextResponse.json({ overrides });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("edit")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const matrix = body?.matrix as PermissionMatrix | undefined;

  if (!matrix)
    return NextResponse.json({ error: "Matriz de permissões ausente." }, { status: 400 });

  const admin = createAdminClient();

  const { data: permissions, error: permissionsError } = await admin
    .from("permissions")
    .select("id, module, action");

  if (permissionsError)
    return NextResponse.json({ error: permissionsError.message }, { status: 500 });

  const rows = [];
  for (const moduleKey of MODULE_KEYS) {
    for (const action of PERMISSION_ACTIONS) {
      const permission = permissions?.find((p) => p.module === moduleKey && p.action === action);
      if (!permission) continue;
      rows.push({
        user_id: id,
        permission_id: permission.id,
        allowed: matrix[moduleKey]?.[action] ?? false,
      });
    }
  }

  if (rows.length > 0) {
    const { error: upsertError } = await admin
      .from("user_permission_overrides")
      .upsert(rows, { onConflict: "user_id,permission_id" });

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
