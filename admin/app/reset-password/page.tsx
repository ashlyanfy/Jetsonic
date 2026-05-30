import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 p-4">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
