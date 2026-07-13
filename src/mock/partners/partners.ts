import { Dimension } from "../iqrh";

export interface Partner { id: string; name: string; type: "association" | "programme" | "professional" | "network"; city: string; departments: readonly string[]; dimensions: readonly Dimension[]; description: string; validation: "qualified" | "to_qualify"; }
export const mockPartners: readonly Partner[] = [
  { id: "PAR001", name: "DYNABUY", type: "network", city: "National", departments: [], dimensions: [Dimension.RelationASoi, Dimension.RelationsAffectives], description: "Partenaire potentiel destiné aux entrepreneurs.", validation: "to_qualify" },
  { id: "PAR002", name: "SKL", type: "network", city: "À qualifier / localisable", departments: [], dimensions: [Dimension.RelationsAffectives, Dimension.VieProfessionnelle], description: "Partenaire potentiel pour coopération, complicité et projection.", validation: "to_qualify" },
  { id: "PAR006", name: "60000 REBONDS", type: "association", city: "À qualifier / localisable", departments: [], dimensions: [Dimension.VieProfessionnelle, Dimension.RelationASoi], description: "Accompagnement potentiel des entrepreneurs et transitions professionnelles.", validation: "to_qualify" },
  { id: "PAR008", name: "VILLAGE BY CA", type: "network", city: "À qualifier / localisable", departments: [], dimensions: [Dimension.RelationASoi, Dimension.RelationsSociales], description: "Réseau entrepreneurial et communautaire potentiel.", validation: "to_qualify" },
  { id: "PAR012", name: "STATION F", type: "network", city: "Paris", departments: ["75"], dimensions: [Dimension.RelationsSociales, Dimension.RelationASoi], description: "Écosystème entrepreneurial pouvant soutenir réseau et appartenance.", validation: "to_qualify" },
];
export const getPartnersForDimension = (dimension: Dimension): readonly Partner[] => mockPartners.filter((partner) => partner.dimensions.includes(dimension));
