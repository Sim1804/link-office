import { Dimension, IqrhWeather, RelationalProfile, type DimensionScore, type ResultatIQRH } from "../iqrh";
import { clamp } from "./random";

export const weatherForScore = (score: number): IqrhWeather => score < 35 ? IqrhWeather.Tempete : score < 50 ? IqrhWeather.Orage : score < 65 ? IqrhWeather.CielCouvert : score < 80 ? IqrhWeather.Eclaircies : IqrhWeather.GrandSoleil;
export const profileForScore = (score: number): RelationalProfile => score < 40 ? RelationalProfile.EnRetrait : score < 55 ? RelationalProfile.EnTransition : score < 70 ? RelationalProfile.Equilibriste : score < 85 ? RelationalProfile.Connecteur : RelationalProfile.Ressource;

export const generateResult = (userId: string, index: number): ResultatIQRH => {
  const base = 28 + ((index * 11) % 65);
  const dimensions = Object.values(Dimension).map((dimension, position): DimensionScore => ({
    dimension, score: clamp(base + (((index + position * 3) % 5) - 2) * 7, 15, 98),
    label: dimension, trend: position === index % 5 ? "up" : "stable",
  }));
  const score = Math.round(dimensions.reduce((total, item) => total + item.score, 0) / dimensions.length);
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0]!;
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0]!;
  return { userId, score, dimensions, weather: weatherForScore(score), profile: profileForScore(score), secondaryProfile: profileForScore(clamp(score + 14, 0, 100)), strengths: [strongest.dimension, "Capacité d'écoute", "Volonté d'agir"], watchpoints: [weakest.dimension, "Régularité des liens", "Temps relationnel"], assessedAt: "2026-07-01T09:00:00.000Z" };
};
