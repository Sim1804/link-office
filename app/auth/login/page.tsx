import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Connexion — LinkOffice",
  description: "Accédez à votre espace LinkOffice",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-3)",
          }}
        >
          Chargement...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
