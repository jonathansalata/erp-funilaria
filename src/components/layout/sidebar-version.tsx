import { formatDateTime } from "@/lib/utils";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
const GIT_COMMIT = process.env.NEXT_PUBLIC_GIT_COMMIT ?? "";
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? "";

export function SidebarVersion() {
  return (
    <div className="text-sidebar-foreground/50 flex flex-col gap-0.5 px-2.5 py-1.5 text-[11px] leading-tight">
      <span>Versão {APP_VERSION}</span>
      {BUILD_DATE && <span>Atualizado em {formatDateTime(BUILD_DATE)}</span>}
      {GIT_COMMIT && <span>Commit {GIT_COMMIT}</span>}
    </div>
  );
}
