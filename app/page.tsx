import Link from "next/link";
import { Brain, ArrowRight, Star, CheckCircle2, ChevronRight, Building2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const STATS = [
  { value: "98%", label: "Satisfaction" },
  { value: "5 min", label: "Pour vos résultats" },
  { value: "30", label: "Questions précises" },
  { value: "12", label: "Profils relationnels" },
];

const STEPS = [
  { step: "01", title: "Répondez au questionnaire", desc: "30 questions pour mesurer vos 5 dimensions relationnelles.", icon: "📋" },
  { step: "02", title: "Découvrez votre profil", desc: "Score IQRH, profil relationnel, météo et radar.", icon: "📊" },
  { step: "03", title: "Guidé par IRIS", desc: "Votre IA coach vous propose un plan de développement personnalisé.", icon: "🧠" },
];

const FEATURES = [
  { title: "Score IQRH précis", desc: "5 dimensions : social, affectif, sentimental, professionnel, relation à soi.", icon: "🎯", badge: "Mesure" },
  { title: "IA IRIS personnalisée", desc: "Un coach IA qui comprend votre contexte et vous guide avec bienveillance.", icon: "⚡", badge: "IA" },
  { title: "Données sécurisées", desc: "Vos données restent confidentielles. Aucun partage sans votre consentement.", icon: "🛡️", badge: "Sécurité" },
];

const TESTIMONIALS = [
  { name: "Marie L.", role: "Entrepreneuse", text: "IRIS m'a aidé à comprendre pourquoi je me sentais si isolée malgré mon réseau. Un vrai déclic.", stars: 5 },
  { name: "Thomas R.", role: "Manager", text: "Le rapport IQRH est d'une précision surprenante. J'ai appris des choses sur moi que je n'aurais jamais verbalisées.", stars: 5 },
  { name: "Camille B.", role: "Étudiante", text: "Simple, rapide, et le chat avec IRIS est vraiment humain. Je recommande à 100%.", stars: 5 },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Global blobs */}
      <div className="blob-violet" />
      <div className="blob-cyan" />

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────── */}
        <section style={{ paddingTop: 140, paddingBottom: 80 }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

            <div className="anim-fade-up">
              <span className="badge badge-violet" style={{ marginBottom: 24, fontSize: 13 }}>
                <Brain size={13} /> Propulsé par l'IA IRIS
              </span>
            </div>

            <h1 className="anim-fade-up delay-1" style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800, fontSize: "clamp(36px, 6vw, 72px)",
              lineHeight: 1.1, color: "var(--text-1)", marginBottom: 24, maxWidth: 900
            }}>
              Comprenez vos <span className="gradient-text">relations</span>,<br />
              transformez votre vie
            </h1>

            <p className="anim-fade-up delay-2" style={{
              color: "var(--text-2)", fontSize: "clamp(15px, 1.8vw, 18px)",
              maxWidth: 600, lineHeight: 1.7, marginBottom: 40
            }}>
              L'IQRH mesure votre qualité de vie relationnelle en 5 dimensions.
              En 5 minutes, obtenez votre profil et les conseils personnalisés de l'IA IRIS.
            </p>

            <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
              <Link href="/auth/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
                Faire le test gratuitement <ArrowRight size={16} />
              </Link>
              <Link href="/business" className="btn btn-secondary btn-lg" style={{ textDecoration: "none", border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.05)" }}>
                <Building2 size={16} style={{ marginRight: 8, color: "#a78bfa" }} /> Solutions Entreprises
              </Link>
            </div>

            {/* Hero preview card */}
            <div className="anim-fade-up delay-4" style={{ width: "100%", maxWidth: 480 }}>
              <div className="glass-strong" style={{ borderRadius: 24, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "var(--text-2)", fontSize: 13 }}>Score global IQRH</span>
                  <span className="badge badge-cyan">⛅ Éclaircies</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span className="gradient-text" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>72</span>
                  <span style={{ color: "var(--text-2)", fontSize: 20 }}>/100</span>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 20 }}>Bonne qualité relationnelle</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Relations sociales", score: 80 },
                    { label: "Relations affectives", score: 70 },
                    { label: "Vie sentimentale", score: 55 },
                    { label: "Vie professionnelle", score: 85 },
                    { label: "Relation à soi", score: 70 },
                  ].map((d) => (
                    <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "var(--text-3)", fontSize: 12, width: 140, flexShrink: 0 }}>{d.label}</span>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${d.score}%` }} />
                      </div>
                      <span style={{ color: "var(--text-2)", fontSize: 12, fontWeight: 600, width: 24, textAlign: "right" }}>{d.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────── */}
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(17,24,39,0.5)", padding: "48px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div className="gradient-text" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                  <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────── */}
        <section id="methode" className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span className="badge badge-violet" style={{ marginBottom: 16 }}>La méthode</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)", marginBottom: 16 }}>
                Simple, rapide, et <span className="gradient-text">révélateur</span>
              </h2>
              <p style={{ color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                3 étapes pour comprendre votre qualité de vie relationnelle.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative" }}>
              {STEPS.map((s, i) => (
                <div key={s.step} style={{ position: "relative" }}>
                  {i < 2 && (
                    <div style={{ position: "absolute", right: -20, top: 40, zIndex: 10, color: "var(--text-3)" }}>
                      <ChevronRight size={20} />
                    </div>
                  )}
                  <div className="card card-hover" style={{ height: "100%" }}>
                    <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-light)", letterSpacing: "0.1em", marginBottom: 8 }}>{s.step}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width:768px){#methode .container>div:last-child{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* ── FEATURES ──────────────────────────────── */}
        <section id="features" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-cyan" style={{ marginBottom: 16 }}>Fonctionnalités</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)" }}>
                Tout ce dont vous avez besoin
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {FEATURES.map(({ title, desc, icon, badge }) => (
                <div key={title} className="card card-hover">
                  <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 20 }}>
                    {icon}
                  </div>
                  <span className="badge badge-violet" style={{ marginBottom: 12 }}>{badge}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width:768px){#features .container>div:last-child{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────── */}
        <section id="temoignages" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-amber" style={{ marginBottom: 16 }}>Témoignages</span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)" }}>
                Ce qu'ils en disent
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {TESTIMONIALS.map(({ name, role, text, stars }) => (
                <div key={name} className="card card-hover">
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={15} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                    "{text}"
                  </p>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width:768px){#temoignages .container>div:last-child{grid-template-columns:1fr!important}}`}</style>
        </section>

        {/* ── CTA FINAL ─────────────────────────────── */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="glass-strong" style={{
              borderRadius: 28, padding: "64px 48px", textAlign: "center",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(124,58,237,0.25)"
            }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 4vw, 40px)", color: "var(--text-1)", marginBottom: 16 }}>
                Prêt à mieux vous <span className="gradient-text">comprendre</span> ?
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: 36, fontSize: 16, lineHeight: 1.6 }}>
                Rejoignez des milliers de personnes qui ont transformé leurs relations grâce à l'IQRH.
              </p>
              <Link href="/auth/register" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
                Commencer gratuitement — 5 minutes <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
