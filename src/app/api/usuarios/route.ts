import { NextResponse } from "next/server";

import { getUsuariosPermissions } from "@/lib/auth/server-permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("view")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("*, role:roles!profiles_role_id_fkey(id, name)")
    .eq("organization_id", auth.organizationId)
    .is("deleted_at", null)
    .order("full_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("create")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const body = await request.json();
  const { name, email, phone, jobTitle, roleId, password } = body as {
    name?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    roleId?: string | null;
    password?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "A senha deve ter no mínimo 8 caracteres." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: name.trim() },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Não foi possível criar o usuário." },
      { status: 400 },
    );
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      organization_id: auth.organizationId,
      full_name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      job_title: jobTitle?.trim() || null,
      role_id: roleId || null,
      status: "active",
      must_change_password: false,
    })
    .select("*, role:roles!profiles_role_id_fkey(id, name)")
    .single();

  if (profileError || !profile) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: profileError?.message ?? "Não foi possível criar o perfil do usuário." },
      { status: 500 },
    );
  }

  return NextResponse.json({ user: profile }, { status: 201 });
}
