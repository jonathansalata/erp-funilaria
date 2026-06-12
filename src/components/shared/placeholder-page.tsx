import { Construction } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

/** Tela "Em construção" usada para módulos ainda não implementados (Fase 0.5 — fundação visual). */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Construction className="text-muted-foreground size-10" />
          <CardHeader className="gap-1 p-0">
            <CardTitle className="font-heading text-lg">Em construção</CardTitle>
            <CardDescription>
              Este módulo será implementado nas próximas fases do roadmap.
            </CardDescription>
          </CardHeader>
        </CardContent>
      </Card>
    </div>
  );
}
