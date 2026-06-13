import { PayablesView } from "@/components/financeiro/payables-view";

export default async function ContasPagarPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return <PayablesView initialStatus={status} />;
}
