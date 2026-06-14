import { Suspense } from "react";

import { RecoverPasswordForm } from "@/components/auth/recover-password-form";

export default function RecoverPasswordPage() {
  return (
    <Suspense>
      <RecoverPasswordForm />
    </Suspense>
  );
}
