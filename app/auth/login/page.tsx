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
            background: "#0b0f19",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
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
