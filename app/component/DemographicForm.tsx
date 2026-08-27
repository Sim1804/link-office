"use client";

import { useState } from "react";

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

const departments = [
  "01 Ain",
  "02 Aisne",
  "03 Allier",
  "04 Alpes-de-Haute-Provence",
  "05 Hautes-Alpes",
  "06 Alpes-Maritimes",
  "07 Ardèche",
  "08 Ardennes",
  "09 Ariège",
  "10 Aube",
  "11 Aude",
  "12 Aveyron",
  "13 Bouches-du-Rhône",
  "14 Calvados",
  "15 Cantal",
  "16 Charente",
  "17 Charente-Maritime",
  "18 Cher",
  "19 Corrèze",
  "2A Corse-du-Sud",
  "2B Haute-Corse",
  "21 Côte-d'Or",
  "22 Côtes-d'Armor",
  "23 Creuse",
  "24 Dordogne",
  "25 Doubs",
  "26 Drôme",
  "27 Eure",
  "28 Eure-et-Loir",
  "29 Finistère",
  "30 Gard",
  "31 Haute-Garonne",
  "32 Gers",
  "33 Gironde",
  "34 Hérault",
  "35 Ille-et-Vilaine",
  "36 Indre",
  "37 Indre-et-Loire",
  "38 Isère",
  "39 Jura",
  "40 Landes",
  "41 Loir-et-Cher",
  "42 Loire",
  "43 Haute-Loire",
  "44 Loire-Atlantique",
  "45 Loiret",
  "46 Lot",
  "47 Lot-et-Garonne",
  "48 Lozère",
  "49 Maine-et-Loire",
  "50 Manche",
  "51 Marne",
  "52 Haute-Marne",
  "53 Mayenne",
  "54 Meurthe-et-Moselle",
  "55 Meuse",
  "56 Morbihan",
  "57 Moselle",
  "58 Nièvre",
  "59 Nord",
  "60 Oise",
  "61 Orne",
  "62 Pas-de-Calais",
  "63 Puy-de-Dôme",
  "64 Pyrénées-Atlantiques",
  "65 Hautes-Pyrénées",
  "66 Pyrénées-Orientales",
  "67 Bas-Rhin",
  "68 Haut-Rhin",
  "69 Rhône",
  "70 Haute-Saône",
  "71 Saône-et-Loire",
  "72 Sarthe",
  "73 Savoie",
  "74 Haute-Savoie",
  "75 Paris",
  "76 Seine-Maritime",
  "77 Seine-et-Marne",
  "78 Yvelines",
  "79 Deux-Sèvres",
  "80 Somme",
  "81 Tarn",
  "82 Tarn-et-Garonne",
  "83 Var",
  "84 Vaucluse",
  "85 Vendée",
  "86 Vienne",
  "87 Haute-Vienne",
  "88 Vosges",
  "89 Yonne",
  "90 Territoire de Belfort",
  "91 Essonne",
  "92 Hauts-de-Seine",
  "93 Seine-Saint-Denis",
  "94 Val-de-Marne",
  "95 Val-d'Oise",
];

export default function DemographicForm({
  value,
  onChange,
  onNext,
  isB2B = false,
}: Props) {
  const [data, setData] = useState<Demographic>(
    value ?? {
      gender: "",
      ageRange: "",
      country: "France",
      department: "",

      occupation: "",
      occupationOther: "",
      organisationSize: "",

      relationshipStatus: "",
      relationshipDetail: "",

      children: null,
      childrenCount: "",

      livingSituation: "",
      livingSituationOther: "",
    }
  );

  function update<K extends keyof Demographic>(
    key: K,
    value: Demographic[K]
  ) {
    const next = {
      ...data,
      [key]: value,
    };

    setData(next);
    onChange(next);
  }

  // Occupations B2B (Q4 restreinte selon spec)
  const B2B_OCCUPATIONS = ["Salarie", "Manager", "Etudiant"];
  // Situations exclues du contexte B2B (spec etape 9)
  const B2B_EXCLUDED_SITUATIONS = ["Entrepreneur", "Retraite", "Demandeur d emploi", "Creation d entreprise",
    "Entrepreneur / Independant", "Retraite / Retraite", "Demandeur d emploi / En recherche d emploi"];

    return (
    <div className="mt-8 space-y-8">

      <h1 className="text-3xl font-bold">
        Variables sociodémographiques
      </h1>

      <p className="text-slate-600">
        Ces informations permettent de contextualiser vos résultats.
      </p>

      {/* Question 1 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          1. Sexe
        </h2>

        {[
          "Femme",
          "Homme",
          "Non binaire",
          "Je préfère ne pas répondre",
        ].map((item) => (

          <label key={item} className="flex items-center gap-3">

            <input
              type="radio"
              name="gender"
              checked={data.gender === item}
              onChange={() => update("gender", item)}
            />

            {item}

          </label>

        ))}

      </div>

      {/* Question 2 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          2. Âge
        </h2>

        <select
          className="w-full rounded-xl border p-3"
          value={data.ageRange}
          onChange={(e) => update("ageRange", e.target.value)}
        >

          <option value="">
            Sélectionner...
          </option>

          <option>18 à 24 ans</option>
          <option>25 à 34 ans</option>
          <option>35 à 44 ans</option>
          <option>45 à 54 ans</option>
          <option>55 à 64 ans</option>
          <option>65 ans et plus</option>

        </select>

      </div>

      {/* Question 3 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          3. Pays de résidence
        </h2>

        <select
          className="w-full rounded-xl border p-3"
          value={data.country}
          onChange={(e) => update("country", e.target.value)}
        >

          <option>France</option>
          <option>Belgique</option>
          <option>Suisse</option>
          <option>Luxembourg</option>
          <option>Canada</option>
          <option>Autre</option>

        </select>

      </div>

      {data.country === "France" && (

        <div className="space-y-3">

          <h2 className="font-semibold">
            Département
          </h2>

          <select
            className="w-full rounded-xl border p-3"
            value={data.department}
            onChange={(e) => update("department", e.target.value)}
          >

            <option value="">
              Sélectionner...
            </option>

            {departments.map((department) => (

              <option
                key={department}
                value={department}
              >
                {department}
              </option>

            ))}

          </select>

        </div>

      )}

      {/* Question 4 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          4. Situation professionnelle
        </h2>

        {(isB2B
          ? [
              "Salarie",
              "Manager",
              "Etudiant",
            ]
          : [
              "Etudiant",
              "Salarie",
              "Manager",
              "Entrepreneur / Independant / Profession liberale / Dirigeant",
              "Demandeur d emploi",
              "Parent au foyer",
              "Retraite",
              "Autre",
            ]
        ).map((item) => (

          <label
            key={item}
            className="flex items-center gap-3"
          >

            <input
              type="radio"
              name="occupation"
              checked={data.occupation === item}
              onChange={() => update("occupation", item)}
            />

            {item}

          </label>

        ))}

      </div>

      {data.occupation === "Autre" && (

        <div className="space-y-3">

          <label className="font-semibold">

            Précisez :

          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={data.occupationOther}
            onChange={(e) =>
              update("occupationOther", e.target.value)
            }
          />

        </div>

      )}

      {/* Q5 : Taille organisation — masquee en B2B (l entreprise est connue) */}
      {!isB2B && (data.occupation === "Salarie" ||
        data.occupation === "Manager" ||
        data.occupation ===
          "Entrepreneur / Independant / Profession liberale / Dirigeant") && (

        <div className="space-y-3">

          <h2 className="font-semibold">
            5. Taille de votre organisation
          </h2>

          {[
            "Travailleur indépendant",
            "2 à 10 salariés",
            "11 à 50 salariés",
            "51 à 250 salariés",
            "Plus de 250 salariés",
          ].map((item) => (

            <label
              key={item}
              className="flex items-center gap-3"
            >

              <input
                type="radio"
                name="organisationSize"
                checked={data.organisationSize === item}
                onChange={() =>
                  update("organisationSize", item)
                }
              />

              {item}

            </label>

          ))}

        </div>

      )}      {/* Question 6 */}

            {/* Question 6 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          6. Situation sentimentale
        </h2>

        {/* Célibataire */}

        <label className="flex items-center gap-3">

          <input
            type="radio"
            name="relationshipStatus"
            checked={data.relationshipStatus === "Célibataire"}
            onChange={() => {
              update("relationshipStatus", "Célibataire");
              update("relationshipDetail", "");
            }}
          />

          Célibataire

        </label>

        {/* En couple */}

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={data.relationshipStatus === "En couple"}
            onChange={(e) => {

              if (e.target.checked) {

                update("relationshipStatus", "En couple");

              } else {

                update("relationshipStatus", "");
                update("relationshipDetail", "");

              }

            }}
          />

          En couple

        </label>

        {data.relationshipStatus === "En couple" && (

          <div className="ml-8 space-y-3 rounded-xl border bg-slate-50 p-4">

            <p className="font-medium">

              Précisez :

            </p>

            <label className="flex items-center gap-3">

              <input
                type="radio"
                name="relationshipDetail"
                checked={data.relationshipDetail === "Marié(e)"}
                onChange={() =>
                  update("relationshipDetail", "Marié(e)")
                }
              />

              Marié(e)

            </label>

            <label className="flex items-center gap-3">

              <input
                type="radio"
                name="relationshipDetail"
                checked={data.relationshipDetail === "Pacsé(e)"}
                onChange={() =>
                  update("relationshipDetail", "Pacsé(e)")
                }
              />

              Pacsé(e)

            </label>

          </div>

        )}

        {/* Séparé */}

        <label className="flex items-center gap-3">

          <input
            type="radio"
            name="relationshipStatus"
            checked={data.relationshipStatus === "Séparé(e) / Divorcé(e)"}
            onChange={() => {
              update("relationshipStatus", "Séparé(e) / Divorcé(e)");
              update("relationshipDetail", "");
            }}
          />

          Séparé(e) / Divorcé(e)

        </label>

        {/* Veuf */}

        <label className="flex items-center gap-3">

          <input
            type="radio"
            name="relationshipStatus"
            checked={data.relationshipStatus === "Veuf(ve)"}
            onChange={() => {
              update("relationshipStatus", "Veuf(ve)");
              update("relationshipDetail", "");
            }}
          />

          Veuf(ve)

        </label>

      </div>
      {/* Question 7 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          7. Avez-vous des enfants ?
        </h2>

        <label className="flex items-center gap-3">

          <input
            type="radio"
            name="children"
            checked={data.children === true}
            onChange={() => update("children", true)}
          />

          Oui

        </label>

        <label className="flex items-center gap-3">

          <input
            type="radio"
            name="children"
            checked={data.children === false}
            onChange={() => {
              update("children", false);
              update("childrenCount", "");
            }}
          />

          Non

        </label>

      </div>

      {data.children === true && (

        <div className="space-y-3">

          <label className="font-semibold">

            Nombre d&apos;enfants

          </label>

          <input
            type="number"
            min={1}
            className="w-full rounded-xl border p-3"
            value={data.childrenCount}
            onChange={(e) =>
              update(
                "childrenCount",
                Number(e.target.value)
              )
            }
          />

        </div>

      )}

      {/* Question 8 */}

      <div className="space-y-3">

        <h2 className="font-semibold">
          8. Vous vivez actuellement :
        </h2>

        {[
          "Seul",
          "En couple",
          "En famille",
          "Colocation",
          "Résidence étudiante",
          "Autre",
        ].map((item) => (

          <label
            key={item}
            className="flex items-center gap-3"
          >

            <input
              type="radio"
              name="livingSituation"
              checked={data.livingSituation === item}
              onChange={() =>
                update("livingSituation", item)
              }
            />

            {item}

          </label>

        ))}

      </div>

      {data.livingSituation === "Autre" && (

        <div className="space-y-3">

          <label className="font-semibold">

            Précisez :

          </label>

          <input
            className="w-full rounded-xl border p-3"
            value={data.livingSituationOther}
            onChange={(e) =>
              update(
                "livingSituationOther",
                e.target.value
              )
            }
          />

        </div>

      )}
            <div className="flex justify-end pt-8">

        <button
          type="button"
          onClick={() => {
            onChange(data);
            onNext();
          }}
          disabled={
            !data.gender ||
            !data.ageRange ||
            !data.country ||
            (data.country === "France" && !data.department) ||
            !data.occupation ||
            (
              data.occupation === "Autre" &&
              !data.occupationOther
            ) ||
            (
              !isB2B &&
              (
                data.occupation === "Salarie" ||
                data.occupation === "Manager" ||
                data.occupation ===
                  "Entrepreneur / Independant / Profession liberale / Dirigeant"
              ) &&
              !data.organisationSize
            ) ||
            !data.relationshipStatus ||
            (
              data.relationshipStatus === "En couple" &&
              !data.relationshipDetail
            ) ||
            data.children === null ||
            (
              data.children === true &&
              !data.childrenCount
            ) ||
            !data.livingSituation ||
            (
              data.livingSituation === "Autre" &&
              !data.livingSituationOther
            )
          }
          className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuer
        </button>

      </div>

    </div>

  );

}
