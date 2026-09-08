export type DimensionCode = "D1" | "D2" | "D3" | "D4" | "D5";

export type Question = {
  id: string;
  dimension: DimensionCode;
  text: string;
};

export const DIMENSIONS: Record<DimensionCode, { label: string; color: string }> = {
  D1: { label: "Relations sociales", color: "#00A99D" },
  D2: { label: "Relations affectives", color: "#199E9A" },
  D3: { label: "Vie sentimentale", color: "#5965E8" },
  D4: { label: "Vie professionnelle", color: "#FFC629" },
  D5: { label: "Relation à soi", color: "#4DDBB2" },
};

export const QUESTIONS: Question[] = [
  ["Q1","D1","Je me sens entouré(e) de personnes sur lesquelles je peux compter."],
  ["Q2","D1","J'ai des relations régulières avec des amis, collègues ou proches."],
  ["Q3","D1","Je me sens intégré(e) dans au moins un groupe social (famille, amis, collègues…)."],
  ["Q4","D1","Lorsque j'ai un problème, je sais vers qui me tourner."],
  ["Q5","D1","Je me sens à l'aise dans mes échanges avec les autres."],
  ["Q6","D1","J'ai des relations qui me nourrissent et m'apportent de l'énergie."],
  ["Q7","D2","Je me sens écouté(e) et compris(e) par mes proches."],
  ["Q8","D2","Je reçois des marques d'affection régulières de mon entourage."],
  ["Q9","D2","Je me sens en sécurité émotionnelle dans mes relations proches."],
  ["Q10","D2","Je peux exprimer mes émotions sans craindre d'être jugé(e)."],
  ["Q11","D2","Je me sens aimé(e) et valorisé(e) dans mes relations importantes."],
  ["Q12","D2","Je dispose de soutien affectif en cas de difficulté."],
  ["Q13","D3","Ma situation sentimentale actuelle me convient globalement."],
  ["Q14","D3","Je suis satisfait(e) de ma vie amoureuse ou de mon célibat."],
  ["Q15","D3","Je me sens en accord avec mes besoins affectifs dans ma vie sentimentale."],
  ["Q16","D3","Ma situation sentimentale contribue positivement à mon équilibre."],
  ["Q17","D3","Je me sens libre d'être moi-même dans ma vie amoureuse."],
  ["Q18","D3","Je peux envisager mon avenir sentimental avec sérénité."],
  ["Q19","D4","Mon activité principale me procure un sentiment d'utilité."],
  ["Q20","D4","Je me sens reconnu(e) dans mon rôle professionnel ou principal."],
  ["Q21","D4","Mon activité est en accord avec mes valeurs."],
  ["Q22","D4","Je trouve du sens dans ce que je fais au quotidien."],
  ["Q23","D4","Mon environnement professionnel favorise les échanges positifs."],
  ["Q24","D4","Je me sens engagé(e) et motivé(e) dans mon activité."],
  ["Q25","D5","Je me sens aligné(e) avec mes valeurs et mes priorités."],
  ["Q26","D5","Je prends du temps pour moi et pour ce qui me fait du bien."],
  ["Q27","D5","Je suis en paix avec qui je suis."],
  ["Q28","D5","Je donne un sens à ce que je vis."],
  ["Q29","D5","Je me sens capable de faire face aux défis de la vie."],
  ["Q30","D5","Je prends soin de mon équilibre intérieur."],
].map(([id, dimension, text]) => ({ id, dimension: dimension as DimensionCode, text }));

export const ANSWERS = [
  { value: 1, label: "Pas du tout d'accord" },
  { value: 2, label: "Plutôt pas d'accord" },
  { value: 3, label: "Ni d'accord, ni pas d'accord" },
  { value: 4, label: "Plutôt d'accord" },
  { value: 5, label: "Tout à fait d'accord" },
];
