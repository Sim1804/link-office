import { Dimension } from "../iqrh";

export enum LikertAnswer { PasDuToutDAccord = 1, PlutotPasDAccord = 2, Neutre = 3, PlutotDAccord = 4, ToutAFaitDAccord = 5 }
export interface Question { id: string; text: string; dimension: Dimension; required: boolean; }
export interface QuestionAnswer { questionId: string; value: LikertAnswer; answeredAt: string; }
export interface Questionnaire { id: string; version: string; title: string; estimatedMinutes: number; questions: readonly Question[]; }
export interface UserQuestionnaire { userId: string; questionnaireId: string; consent: boolean; answers: readonly QuestionAnswer[]; completedAt: string; }

const groups: readonly [Dimension, readonly string[]][] = [
  [Dimension.RelationsSociales, ["Je peux compter sur plusieurs personnes si je rencontre une difficulté importante.", "Je me sens entouré(e) au quotidien.", "Je participe régulièrement à des activités ou à des échanges avec d'autres personnes.", "Je me sens accepté(e) tel(le) que je suis.", "Je sais vers qui me tourner dans une période difficile.", "Je crée facilement de nouvelles relations."]],
  [Dimension.RelationsAffectives, ["Je me sens aimé(e) et apprécié(e).", "Je peux exprimer mes émotions auprès de personnes de confiance.", "Je reçois le soutien affectif dont j'ai besoin.", "Je me sens émotionnellement en sécurité.", "Je peux être moi-même avec les personnes qui comptent.", "Je reçois régulièrement des marques de bienveillance."]],
  [Dimension.VieSentimentale, ["Je suis satisfait(e) de ma vie sentimentale actuelle.", "Ma situation sentimentale correspond à ce que je souhaite.", "Je peux exprimer librement mes besoins affectifs.", "Je vis ou espère vivre des relations épanouissantes.", "Je gère sereinement les difficultés sentimentales.", "J'ai confiance dans mon avenir sentimental."]],
  [Dimension.VieProfessionnelle, ["Je me sens reconnu(e) dans mon activité principale.", "Je peux compter sur les personnes de mon activité.", "Je peux exprimer librement mes idées.", "Mon activité me donne un sentiment d'utilité.", "Je me sens respecté(e) dans mon activité.", "Je me sens engagé(e) dans mon quotidien."]],
  [Dimension.RelationASoi, ["Je connais mes besoins relationnels.", "Je respecte mes limites.", "Je me sens capable de demander de l'aide.", "Je prends du temps pour mon équilibre.", "Je me fais confiance dans mes relations.", "Je suis bienveillant(e) envers moi-même."]],
];
export const mockQuestionnaire: Questionnaire = { id: "iqrh-v1", version: "1.0", title: "Indice de Qualité des Relations Humaines", estimatedMinutes: 9, questions: groups.flatMap(([dimension, questions], groupIndex) => questions.map((text, questionIndex) => ({ id: `Q${groupIndex * 6 + questionIndex + 1}`, text, dimension, required: true }))) };
export const generateQuestionnaireForUser = (userId: string, index: number): UserQuestionnaire => ({ userId, questionnaireId: mockQuestionnaire.id, consent: true, answers: mockQuestionnaire.questions.map((question, position) => ({ questionId: question.id, value: (1 + ((index + position * 2) % 5)) as LikertAnswer, answeredAt: "2026-07-01T09:00:00.000Z" })), completedAt: "2026-07-01T09:09:00.000Z" });
