import { NextResponse } from "next/server";

import { getUsuariosPermissions } from "@/lib/auth/server-permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("edit")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, jobTitle, roleId } = body as {
    name?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    roleId?: string | null;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: current, error: currentError } = await admin
    .from("profiles")
    .select("email")
    .eq("id", id)
    .single();

  if (currentError || !current) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (current.email !== email.trim()) {
    const { error: emailError } = await admin.auth.admin.updateUserById(id, {
      email: email.trim(),
    });
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }
  }

  const { data: profile, error: updateError } = await admin
    .from("profiles")
    .update({
      full_name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      job_title: jobTitle?.trim() || null,
      role_id: roleId || null,
    })
    .eq("id", id)
    .select("*, role:roles!profiles_role_id_fkey(id, name)")
    .single();

  if (updateError || !profile) {
    return NextResponse.json(
      { error: updateError?.message ?? "Não foi possível atualizar o usuário." },
      { status: 500 },
    );
  }

  return NextResponse.json({ user: profile });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("delete")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const { id } = await params;

  if (id === auth.userId) {
    return NextResponse.json(
      { error: "Não é possível excluir o próprio usuário." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
