import { NextResponse } from "next/server";

import { getUsuariosPermissions } from "@/lib/auth/server-permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("edit")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const password = body?.password as string | undefined;

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "A senha deve ter no mínimo 8 caracteres." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
