import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("La variable d'environnement STRIPE_SECRET_KEY est manquante.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2026-07-29.dahlia" as any,
  typescript: true,
});
