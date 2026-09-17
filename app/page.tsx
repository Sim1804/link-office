import Link from "next/link";
import { Brain, ArrowRight, Star, CheckCircle2, ChevronRight, Building2, ClipboardList, BarChart3, Bot, Target, Sparkles, ShieldCheck, User, HeartPulse, Landmark } from "lucide-react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Données statistiques affichées dans la section STATS.
 * Met en avant l'efficacité et la précision de la plateforme.
 */
const STATS = [
  { value: "98%", label: "Satisfaction" },
  { value: "5 min", label: "Pour vos résultats" },
  { value: "30", label: "Questions précises" },
  { value: "12", label: "Profils relationnels" },
];

/**
 * Étapes du parcours utilisateur (How it works).
 * Explique le fonctionnement de l'évaluation IQRH.
 */
const STEPS = [
  { step: "01", title: "Répondez au questionnaire", desc: "30 questions pour mesurer vos 5 dimensions relationnelles.", icon: <ClipboardList size={32} color="var(--primary)" /> },
  { step: "02", title: "Découvrez votre profil", desc: "Score IQRH, profil relationnel, météo et radar.", icon: <BarChart3 size={32} color="#34d399" /> },
  { step: "03", title: "Guidé par IRIS", desc: "Votre IA coach vous propose un plan de développement personnalisé.", icon: <Bot size={32} color="var(--primary)" /> },
];

/**
 * Fonctionnalités principales (Features).
 * Met en avant les points forts (Mesure, IA, Sécurité).
 */
const FEATURES = [
  { title: "Score IQRH précis", desc: "5 dimensions : social, affectif, sentimental, professionnel, relation à soi.", icon: <Target size={24} color="var(--primary)" />, badge: "Mesure" },
  { title: "IA IRIS personnalisée", desc: "Un coach IA qui comprend votre contexte et vous guide avec bienveillance.", icon: <Sparkles size={24} color="var(--primary)" />, badge: "IA" },
  { title: "Données sécurisées", desc: "Vos données restent confidentielles. Aucun partage sans votre consentement.", icon: <ShieldCheck size={24} color="#34d399" />, badge: "Sécurité" },
];

/**
 * Témoignages fictifs ou réels d'utilisateurs.
 */
const TESTIMONIALS = [
  { name: "Marie L.", role: "Entrepreneuse", text: "IRIS m'a aidé à comprendre pourquoi je me sentais si isolée malgré mon réseau. Un vrai déclic.", stars: 5 },
  { name: "Thomas R.", role: "Manager", text: "Le rapport IQRH est d'une précision surprenante. J'ai appris des choses sur moi que je n'aurais jamais verbalisées.", stars: 5 },
  { name: "Camille B.", role: "Étudiante", text: "Simple, rapide, et le chat avec IRIS est vraiment humain. Je recommande à 100%.", stars: 5 },
];

export default function HomePage() {
  return (
    <>
      <PublicNavbar />

      {/* No global blobs */}
      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────── */}
        <section style={{ 
          paddingTop: 180, 
          paddingBottom: 120, 
          background: "linear-gradient(135deg, var(--bg) 0%, rgba(0,169,157,0.05) 50%, rgba(89,101,232,0.05) 100%)",
          borderBottom: "1px solid var(--border)"
        }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

            <div className="anim-fade-up">
              <span className="badge" style={{ marginBottom: 24, fontSize: 13, background: "rgba(18,61,70,0.05)", color: "var(--text-1)", borderRadius: 9999, padding: "6px 16px" }}>
                <Brain size={13} style={{ display: "inline", marginRight: 6 }} color="var(--primary)" /> 
                <span style={{ fontWeight: 600 }}>Laboratoire du lien humain</span>
              </span>
            </div>

            <h1 className="anim-fade-up delay-1" style={{
              fontFamily: "var(--font-family-display)",
              fontWeight: 800, fontSize: "clamp(40px, 6vw, 76px)",
              lineHeight: 1.1, color: "var(--text-1)", marginBottom: 28, maxWidth: 900
            }}>
              Et si le lien humain devenait un indicateur de <span style={{ color: "var(--primary)" }}>notre santé ?</span>
            </h1>

            <p className="anim-fade-up delay-2" style={{
              color: "var(--primary)", fontSize: "clamp(18px, 2.5vw, 22px)",
              fontWeight: 600, maxWidth: 700, lineHeight: 1.6, marginBottom: 48
            }}>
              Comprendre. Observer. Mesurer. Agir.
            </p>

            <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Découvrir l'univers LINK OFFICE <ArrowRight size={16} />
              </Link>
            </div>

            {/* Carte de prévisualisation du score (Hero preview card) */}
            <div className="anim-fade-up delay-4" style={{ width: "100%", maxWidth: 480 }}>
              <div className="card" style={{ padding: 32 }}>
                
                {/* En-tête de la carte avec le score global */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "var(--text-2)", fontSize: 13 }}>Score global IQRH</span>
                  <span className="badge badge-cyan">⛅ Éclaircies</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: "var(--text-1)" }}>72</span>
                  <span style={{ color: "var(--text-2)", fontSize: 20 }}>/100</span>
                </div>
                <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 20 }}>Bonne qualité relationnelle</p>
                
                {/* Liste des scores par dimension relationnelle */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Relations sociales", score: 80 },
                    { label: "Relations affectives", score: 70 },
                    { label: "Vie sentimentale", score: 55 },
                    { label: "Vie professionnelle", score: 85 },
                    { label: "Relation à soi", score: 70 },
                  ].map((dimension) => (
                    <div key={dimension.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "var(--text-3)", fontSize: 12, width: 140, flexShrink: 0 }}>{dimension.label}</span>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${dimension.score}%` }} />
                      </div>
                      <span style={{ color: "var(--text-2)", fontSize: 12, fontWeight: 600, width: 24, textAlign: "right" }}>
                        {dimension.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────── */}
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(18,61,70,0.02)", padding: "64px 0" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div className="gradient-text" style={{ fontFamily: "var(--font-family-display)", fontSize: 42, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                  <div style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
        </section>

        {/* ── SECTION IQRH ──────────────────────────── */}
        <section id="iqrh" className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span className="badge badge-iqrh" style={{ marginBottom: 16 }}>La méthode IQRH</span>
              <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)", marginBottom: 16 }}>
                À qui s'adresse l'Indice de Qualité <span style={{ color: "var(--primary)" }}>Relationnelle</span> ?
              </h2>
              <p style={{ color: "var(--text-2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
                L'IQRH est un outil scientifique qui s'adapte à votre contexte pour mesurer et améliorer le lien humain. Choisissez votre parcours :
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {/* Parcours B2C */}
              <div className="card card-hover" style={{ display: "flex", flexDirection: "column", height: "100%", borderTop: "4px solid var(--primary)" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}><User size={40} color="var(--primary)" /></div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>Pour les Particuliers</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, flex: 1, marginBottom: 24 }}>
                  Comprenez vos relations, identifiez vos points de blocage et recevez un accompagnement bienveillant de notre IA IRIS pour vous épanouir.
                </p>
                <Link href="/auth/register" className="btn btn-primary btn-md" style={{ width: "100%" }}>
                  Faire mon test IQRH
                </Link>
              </div>

              {/* Parcours B2B2C */}
              <div className="card card-hover" style={{ display: "flex", flexDirection: "column", height: "100%", borderTop: "4px solid var(--cyan)" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}><HeartPulse size={40} color="var(--cyan)" /></div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>Pour les Mutuelles & Assurances</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, flex: 1, marginBottom: 24 }}>
                  Intégrez la santé relationnelle à vos offres de prévention. Réduisez les risques psychosociaux (RPS) et fidélisez vos adhérents avec un outil innovant.
                </p>
                <Link href="/business" className="btn btn-primary btn-md" style={{ width: "100%" }}>
                  Découvrir l'offre B2B2C
                </Link>
              </div>

              {/* Parcours B2G */}
              <div className="card card-hover" style={{ display: "flex", flexDirection: "column", height: "100%", borderTop: "4px solid var(--indigo)" }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}><Landmark size={40} color="var(--indigo)" /></div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>Pour les Territoires & Collectivités</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, flex: 1, marginBottom: 24 }}>
                  Cartographiez l'isolement social sur votre territoire. Agissez avec précision grâce à notre observatoire et redynamisez le lien de proximité.
                </p>
                <Link href="/business" className="btn btn-action btn-md" style={{ width: "100%" }}>
                  Découvrir l'observatoire
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION IRIS ──────────────────────────── */}
        <section id="iris" className="section" style={{ background: "rgba(0,169,157,0.02)" }}>
          <div className="container">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 64 }}>
              <div style={{ flex: "1 1 400px" }}>
                <span className="badge badge-iris" style={{ marginBottom: 16 }}>Votre Coach IA</span>
                <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)", marginBottom: 16, lineHeight: 1.2 }}>
                  Découvrez <span style={{ color: "var(--indigo)" }}>IRIS</span>,<br/> l'intelligence bienveillante
                </h2>
                <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
                  IRIS n'est pas un simple chatbot. C'est une intelligence artificielle entraînée pour comprendre les nuances de vos relations humaines avec empathie et sans aucun jugement.
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
                  {[
                    "Analyse en temps réel de votre profil IQRH",
                    "Suggestions d'actions concrètes et mesurables",
                    "Confidentialité totale de vos échanges",
                    "Un ton bienveillant, inclusif et inspirant"
                  ].map((feature, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-1)", fontWeight: 500, fontSize: 15 }}>
                      <CheckCircle2 color="var(--indigo)" size={20} /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className="btn btn-indigo btn-lg" style={{ boxShadow: "0 8px 32px rgba(89, 101, 232, 0.3)" }}>
                  Discuter avec IRIS <Brain size={18} style={{ marginLeft: 8 }} />
                </Link>
              </div>
              <div style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
                {/* Mockup de discussion IRIS */}
                <div className="card" style={{ width: "100%", maxWidth: 400, padding: 0, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px rgba(89, 101, 232, 0.15)", overflow: "hidden", border: "1px solid rgba(89, 101, 232, 0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "linear-gradient(180deg, rgba(89, 101, 232, 0.08) 0%, rgba(89, 101, 232, 0.02) 100%)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(89, 101, 232, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Brain color="var(--indigo)" size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-family-display)" }}>IRIS</div>
                      <div style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 600 }}>Coach Relationnel IA</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, var(--action) 0%, var(--action) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Brain size={16} color="white" />
                      </div>
                      <div style={{ background: "rgba(89, 101, 232, 0.08)", padding: "12px 16px", borderRadius: 18, borderTopLeftRadius: 4, color: "var(--text-1)", fontSize: 14, lineHeight: 1.6, maxWidth: "85%" }}>
                        Bonjour ! J'ai analysé votre score IQRH. Vos relations professionnelles sont au beau fixe (85/100). Bravo ! En revanche, votre vie sentimentale semble traverser une période d'orage (55/100). Souhaitez-vous qu'on en discute ?
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: "row-reverse" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={16} color="var(--text-2)" />
                      </div>
                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: 18, borderTopRightRadius: 4, color: "var(--text-1)", fontSize: 14, lineHeight: 1.6, alignSelf: "flex-end", maxWidth: "85%" }}>
                        Oui, c'est vrai que c'est difficile en ce moment...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────── */}
        <section id="temoignages" className="section" style={{ paddingTop: 96 }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-outline" style={{ marginBottom: 16 }}>Témoignages</span>
              <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)" }}>
                Ce qu'ils en disent
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {TESTIMONIALS.map(({ name, role, text, stars }) => (
                <div key={name} className="card card-hover">
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={15} color="#FFC629" fill="#FFC629" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                    "{text}"
                  </p>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{name}</p>
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
            <div className="card" style={{
              padding: "64px 48px", textAlign: "center",
              borderTop: "4px solid var(--primary)"
            }}>
              <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(26px, 4vw, 40px)", color: "var(--text-1)", marginBottom: 16 }}>
                Prêt à mieux vous <span style={{ color: "var(--primary)" }}>comprendre</span> ?
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: 36, fontSize: 16, lineHeight: 1.6 }}>
                Rejoignez des milliers de personnes qui ont transformé leurs relations grâce à l'IQRH.
              </p>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                Faire le test IQRH <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
