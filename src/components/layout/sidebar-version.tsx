import { getAppMetadata } from "@/lib/app-metadata";
import { formatDateTime } from "@/lib/utils";

export function SidebarVersion() {
  const { version, build, deploy, environment } = getAppMetadata();

  return (
    <div className="text-sidebar-foreground/50 flex flex-col gap-0.5 px-2.5 py-1.5 text-[11px] leading-tight">
      <span>Versão: {version}</span>
      {build && <span>Build: {build}</span>}
      {deploy && <span>Deploy: {formatDateTime(deploy)}</span>}
      <span>Ambiente: {environment}</span>
    </div>
  );
}
