"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type Demographic = {
  gender: string;
  ageRange: string;
  country: string;
  department: string;
  occupation: string;
  occupationOther: string;
  organisationSize: string;
  relationshipStatus: string;
  relationshipDetail: string;
  children: boolean | null;
  childrenCount: number | "";
  livingSituation: string;
  livingSituationOther: string;
};

type Props = {
  value: Demographic | null;
  onChange: (value: Demographic) => void;
  onNext: () => void;
  isB2B?: boolean;
};

/* ── Données statiques ──────────────────────────────────────────── */
const departments = [
  "01 Ain","02 Aisne","03 Allier","04 Alpes-de-Haute-Provence","05 Hautes-Alpes",
  "06 Alpes-Maritimes","07 Ardèche","08 Ardennes","09 Ariège","10 Aube","11 Aude",
  "12 Aveyron","13 Bouches-du-Rhône","14 Calvados","15 Cantal","16 Charente",
  "17 Charente-Maritime","18 Cher","19 Corrèze","2A Corse-du-Sud","2B Haute-Corse",
  "21 Côte-d'Or","22 Côtes-d'Armor","23 Creuse","24 Dordogne","25 Doubs","26 Drôme",
  "27 Eure","28 Eure-et-Loir","29 Finistère","30 Gard","31 Haute-Garonne","32 Gers",
  "33 Gironde","34 Hérault","35 Ille-et-Vilaine","36 Indre","37 Indre-et-Loire",
  "38 Isère","39 Jura","40 Landes","41 Loir-et-Cher","42 Loire","43 Haute-Loire",
  "44 Loire-Atlantique","45 Loiret","46 Lot","47 Lot-et-Garonne","48 Lozère",
  "49 Maine-et-Loire","50 Manche","51 Marne","52 Haute-Marne","53 Mayenne",
  "54 Meurthe-et-Moselle","55 Meuse","56 Morbihan","57 Moselle","58 Nièvre",
  "59 Nord","60 Oise","61 Orne","62 Pas-de-Calais","63 Puy-de-Dôme",
  "64 Pyrénées-Atlantiques","65 Hautes-Pyrénées","66 Pyrénées-Orientales",
  "67 Bas-Rhin","68 Haut-Rhin","69 Rhône","70 Haute-Saône","71 Saône-et-Loire",
  "72 Sarthe","73 Savoie","74 Haute-Savoie","75 Paris","76 Seine-Maritime",
  "77 Seine-et-Marne","78 Yvelines","79 Deux-Sèvres","80 Somme","81 Tarn",
  "82 Tarn-et-Garonne","83 Var","84 Vaucluse","85 Vendée","86 Vienne",
  "87 Haute-Vienne","88 Vosges","89 Yonne","90 Territoire de Belfort",
  "91 Essonne","92 Hauts-de-Seine","93 Seine-Saint-Denis","94 Val-de-Marne","95 Val-d'Oise",
];

/* ── Composant styles partagés ──────────────────────────────────── */
const QUESTION_STYLE: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: 12,
};

const QUESTION_TITLE_STYLE: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4,
};

const RADIO_LABEL_STYLE: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  fontSize: 14, color: "#94a3b8", cursor: "pointer",
  padding: "10px 14px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.02)",
  transition: "all 0.15s",
};

const RADIO_LABEL_ACTIVE_STYLE: React.CSSProperties = {
  ...RADIO_LABEL_STYLE,
  border: "1px solid rgba(124,58,237,0.4)",
  background: "rgba(124,58,237,0.08)",
  color: "#c4b5fd",
};

/* ── Composant principal ────────────────────────────────────────── */
export default function DemographicForm({ value, onChange, onNext, isB2B = false }: Props) {
  const [data, setData] = useState<Demographic>(
    value ?? {
      gender: "", ageRange: "", country: "France", department: "",
      occupation: "", occupationOther: "", organisationSize: "",
      relationshipStatus: "", relationshipDetail: "",
      children: null, childrenCount: "",
      livingSituation: "", livingSituationOther: "",
    }
  );

  function update<K extends keyof Demographic>(key: K, val: Demographic[K]) {
    const next = { ...data, [key]: val };
    setData(next);
    onChange(next);
  }

  const showOrgSize =
    !isB2B &&
    (data.occupation === "Salarié" ||
      data.occupation === "Manager" ||
      data.occupation === "Entrepreneur / Indépendant / Profession libérale / Dirigeant");

  const isValid =
    !!data.gender &&
    !!data.ageRange &&
    !!data.country &&
    (data.country !== "France" || !!data.department) &&
    !!data.occupation &&
    (data.occupation !== "Autre" || !!data.occupationOther) &&
    (!showOrgSize || !!data.organisationSize) &&
    !!data.relationshipStatus &&
    (data.relationshipStatus !== "En couple" || !!data.relationshipDetail) &&
    data.children !== null &&
    (data.children !== true || !!data.childrenCount) &&
    !!data.livingSituation &&
    (data.livingSituation !== "Autre" || !!data.livingSituationOther);

  const occupations = isB2B
    ? ["Salarié", "Manager", "Étudiant"]
    : [
        "Étudiant", "Salarié", "Manager",
        "Entrepreneur / Indépendant / Profession libérale / Dirigeant",
        "Demandeur d'emploi", "Parent au foyer", "Retraité", "Autre",
      ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      <div>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontWeight: 800, fontSize: 26, color: "#f8fafc", marginBottom: 8,
        }}>
          Variables sociodémographiques
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          Ces informations permettent de contextualiser vos résultats IQRH.
          Elles restent strictement confidentielles.
        </p>
      </div>

      {/* Q1 — Sexe */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>1. Sexe</p>
        {["Femme", "Homme", "Non binaire", "Je préfère ne pas répondre"].map(item => (
          <label key={item} style={data.gender === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
            <input
              type="radio" name="gender"
              checked={data.gender === item}
              onChange={() => update("gender", item)}
              style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
            />
            {item}
          </label>
        ))}
      </div>

      {/* Q2 — Âge */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>2. Âge</p>
        <select
          className="input-field"
          value={data.ageRange}
          onChange={e => update("ageRange", e.target.value)}
        >
          <option value="">Sélectionner...</option>
          <option>18 à 24 ans</option>
          <option>25 à 34 ans</option>
          <option>35 à 44 ans</option>
          <option>45 à 54 ans</option>
          <option>55 à 64 ans</option>
          <option>65 ans et plus</option>
        </select>
      </div>

      {/* Q3 — Pays */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>3. Pays de résidence</p>
        <select
          className="input-field"
          value={data.country}
          onChange={e => update("country", e.target.value)}
        >
          <option>France</option>
          <option>Belgique</option>
          <option>Suisse</option>
          <option>Luxembourg</option>
          <option>Canada</option>
          <option>Autre</option>
        </select>
      </div>

      {/* Q3b — Département (si France) */}
      {data.country === "France" && (
        <div style={QUESTION_STYLE}>
          <p style={QUESTION_TITLE_STYLE}>Département</p>
          <select
            className="input-field"
            value={data.department}
            onChange={e => update("department", e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}

      {/* Q4 — Situation professionnelle */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>4. Situation professionnelle</p>
        {occupations.map(item => (
          <label key={item} style={data.occupation === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
            <input
              type="radio" name="occupation"
              checked={data.occupation === item}
              onChange={() => update("occupation", item)}
              style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
            />
            {item}
          </label>
        ))}
      </div>

      {/* Q4b — Précision si "Autre" */}
      {data.occupation === "Autre" && (
        <div style={QUESTION_STYLE}>
          <label style={QUESTION_TITLE_STYLE}>Précisez votre situation</label>
          <input
            className="input-field"
            placeholder="Décrivez votre situation professionnelle"
            value={data.occupationOther}
            onChange={e => update("occupationOther", e.target.value)}
          />
        </div>
      )}

      {/* Q5 — Taille organisation (masquée en B2B) */}
      {showOrgSize && (
        <div style={QUESTION_STYLE}>
          <p style={QUESTION_TITLE_STYLE}>5. Taille de votre organisation</p>
          {[
            "Travailleur indépendant",
            "2 à 10 salariés",
            "11 à 50 salariés",
            "51 à 250 salariés",
            "Plus de 250 salariés",
          ].map(item => (
            <label key={item} style={data.organisationSize === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
              <input
                type="radio" name="organisationSize"
                checked={data.organisationSize === item}
                onChange={() => update("organisationSize", item)}
                style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
              />
              {item}
            </label>
          ))}
        </div>
      )}

      {/* Q6 — Situation sentimentale */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>6. Situation sentimentale</p>

        {["Célibataire", "Séparé(e) / Divorcé(e)", "Veuf(ve)"].map(item => (
          <label key={item} style={data.relationshipStatus === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
            <input
              type="radio" name="relationshipStatus"
              checked={data.relationshipStatus === item}
              onChange={() => { update("relationshipStatus", item); update("relationshipDetail", ""); }}
              style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
            />
            {item}
          </label>
        ))}

        {/* En couple */}
        <label style={data.relationshipStatus === "En couple" ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
          <input
            type="radio" name="relationshipStatus"
            checked={data.relationshipStatus === "En couple"}
            onChange={() => update("relationshipStatus", "En couple")}
            style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
          />
          En couple
        </label>

        {data.relationshipStatus === "En couple" && (
          <div style={{
            marginLeft: 24, display: "flex", flexDirection: "column", gap: 8,
            padding: "14px 16px", borderRadius: 10,
            background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)",
          }}>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Précisez :</p>
            {["En union libre", "Pacsé(e)", "Marié(e)"].map(item => (
              <label key={item} style={data.relationshipDetail === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
                <input
                  type="radio" name="relationshipDetail"
                  checked={data.relationshipDetail === item}
                  onChange={() => update("relationshipDetail", item)}
                  style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
                />
                {item}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Q7 — Enfants */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>7. Avez-vous des enfants ?</p>
        {[
          { label: "Oui", val: true },
          { label: "Non", val: false },
        ].map(({ label, val }) => (
          <label key={label} style={data.children === val ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
            <input
              type="radio" name="children"
              checked={data.children === val}
              onChange={() => { update("children", val); if (!val) update("childrenCount", ""); }}
              style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
            />
            {label}
          </label>
        ))}
      </div>

      {data.children === true && (
        <div style={QUESTION_STYLE}>
          <label style={QUESTION_TITLE_STYLE}>Nombre d'enfants</label>
          <input
            type="number" min={1} max={20}
            className="input-field"
            style={{ maxWidth: 120 }}
            value={data.childrenCount}
            onChange={e => update("childrenCount", Number(e.target.value))}
            placeholder="Ex : 2"
          />
        </div>
      )}

      {/* Q8 — Situation de vie */}
      <div style={QUESTION_STYLE}>
        <p style={QUESTION_TITLE_STYLE}>8. Vous vivez actuellement :</p>
        {["Seul(e)", "En couple", "En famille", "Colocation", "Résidence étudiante", "Autre"].map(item => (
          <label key={item} style={data.livingSituation === item ? RADIO_LABEL_ACTIVE_STYLE : RADIO_LABEL_STYLE}>
            <input
              type="radio" name="livingSituation"
              checked={data.livingSituation === item}
              onChange={() => update("livingSituation", item)}
              style={{ accentColor: "#7c3aed", width: 16, height: 16, flexShrink: 0 }}
            />
            {item}
          </label>
        ))}
      </div>

      {data.livingSituation === "Autre" && (
        <div style={QUESTION_STYLE}>
          <label style={QUESTION_TITLE_STYLE}>Précisez votre situation de vie</label>
          <input
            className="input-field"
            placeholder="Décrivez votre situation de vie"
            value={data.livingSituationOther}
            onChange={e => update("livingSituationOther", e.target.value)}
          />
        </div>
      )}

      {/* Bouton Continuer */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
        <button
          type="button"
          onClick={() => { onChange(data); onNext(); }}
          disabled={!isValid}
          className="btn btn-primary btn-lg"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          Continuer <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
