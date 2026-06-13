import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppMetadata } from "@/lib/app-metadata";
import { VERSION_HISTORY } from "@/lib/mock-data/settings";
import { formatDate, formatDateTime } from "@/lib/utils";

export function AboutSystem() {
  const { version, build, deploy, environment } = getAppMetadata();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
          <CardDescription>
            Informações de versão geradas automaticamente a partir do package.json, do histórico git
            e do ambiente de execução — sem valores fixos no código.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm">Versão</dt>
              <dd className="font-medium">{version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Build</dt>
              <dd className="font-medium">{build || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Deploy</dt>
              <dd className="font-medium">{deploy ? formatDateTime(deploy) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">Ambiente</dt>
              <dd className="font-medium">{environment}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Versões</CardTitle>
          <CardDescription>Resumo das últimas alterações entregues no sistema.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          {VERSION_HISTORY.map((entry) => (
            <div key={entry.version} className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
              <div className="flex shrink-0 items-baseline gap-2 sm:w-40">
                <span className="font-medium">v{entry.version}</span>
                <span className="text-muted-foreground text-xs">{formatDate(entry.date)}</span>
              </div>
              <p className="text-muted-foreground text-sm">{entry.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
