import { OrdensServicoView } from "@/components/ordens-servico/ordens-servico-view";

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Pipeline de Ordens de Serviço</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhe a execução dos serviços, do início até a entrega ao cliente.
        </p>
      </div>

      <OrdensServicoView initialStatus={status} />
    </div>
  );
}
