import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getUsuariosPermissions } from "@/lib/auth/server-permissions";

export async function GET() {
  const auth = await getUsuariosPermissions();
  if (!auth) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if (!auth.can("view")) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("fn_list_roles");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ roles: data });
}
