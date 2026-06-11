import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>ERP Funilaria</CardTitle>
            <CardDescription>Fase 0 — base do projeto</CardDescription>
          </div>
          <ThemeToggle />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Estrutura inicial do projeto configurada com sucesso. As regras de negócio serão
            implementadas a partir da Fase 1.
          </p>
          <div className="flex items-center gap-2">
            <Badge>Next.js 16</Badge>
            <Badge variant="secondary">Tailwind v4</Badge>
            <Badge variant="outline">Shadcn/UI</Badge>
          </div>
          <Button disabled>Em construção</Button>
        </CardContent>
      </Card>
    </div>
  );
}
