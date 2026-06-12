import { Suspense } from "react";

import { NewInspectionForm } from "@/components/vistorias/new-inspection-form";

export default function NovaVistoriaPage() {
  return (
    <Suspense>
      <NewInspectionForm />
    </Suspense>
  );
}
