import { pick } from "./random";

const firstNames = ["Emma", "Lucas", "Chloé", "Hugo", "Léa", "Noah", "Camille", "Jules", "Inès", "Arthur"];
const lastNames = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau"];
const cities = [
  ["Paris", "75"], ["Lyon", "69"], ["Marseille", "13"], ["Lille", "59"], ["Bordeaux", "33"],
  ["Nantes", "44"], ["Toulouse", "31"], ["Strasbourg", "67"], ["Rennes", "35"], ["Montpellier", "34"],
] as const;
const occupations = ["Étudiant", "Salarié", "Manager", "Entrepreneur", "Demandeur d'emploi", "Parent au foyer", "Retraité"] as const;

export const fakeIdentity = (index: number) => {
  const firstName = pick(firstNames, index);
  const lastName = pick(lastNames, Math.floor(index / firstNames.length));
  const [city, department] = pick(cities, index);
  return {
    firstName, lastName, city, department,
    email: `${firstName}.${lastName}.${index + 1}@example.linkoffice.fr`.toLowerCase(),
    age: 19 + ((index * 7) % 48), profession: pick(occupations, index),
    avatar: `https://i.pravatar.cc/160?img=${(index % 70) + 1}`,
  };
};
