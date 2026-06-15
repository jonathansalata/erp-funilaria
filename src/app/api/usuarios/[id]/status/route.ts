import { NextResponse } from "next/server";

import { getUsuariosPermissions } from "@/lib/auth/server-permissions";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = ["active", "inactive", "blocked"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("edit")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const status = body?.status as Status | undefined;

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  if (id === auth.userId) {
    return NextResponse.json(
      { error: "Não é possível alterar o status do próprio usuário." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: status === "blocked" ? "876000h" : "none",
  });
  if (banError) return NextResponse.json({ error: banError.message }, { status: 500 });

  const { data: profile, error: updateError } = await admin
    .from("profiles")
    .update({ status })
    .eq("id", id)
    .select("*, role:roles!profiles_role_id_fkey(id, name)")
    .single();

  if (updateError || !profile) {
    return NextResponse.json(
      { error: updateError?.message ?? "Não foi possível atualizar o status." },
      { status: 500 },
    );
  }

  return NextResponse.json({ user: profile });
}
