import { getMockBinome } from "./binome";
import { getMockDashboard } from "./dashboard";
import { getMockNotifications } from "./notifications";
import { getMockOrdonnance } from "./ordonnance";
import { getMockRecommendations } from "./recommendations";
import { getMockResult } from "./iqrh";
import { mockQuestionnaire } from "./questionnaire";
import { getMockUser, mockUsers } from "./users";

const delay = <T>(value: T, milliseconds = 300): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), milliseconds));
export const getUser = (id: string) => delay(getMockUser(id));
export const getUsers = () => delay(mockUsers);
export const getQuestionnaire = () => delay(mockQuestionnaire);
export const getResult = (userId: string) => delay(getMockResult(userId));
export const getRecommendations = (userId: string) => delay(getMockRecommendations(userId));
export const getOrdonnance = (userId: string) => delay(getMockOrdonnance(userId));
export const getBinome = (userId: string) => delay(getMockBinome(userId));
export const getDashboard = (userId: string) => delay(getMockDashboard(userId));
export const getNotifications = (userId: string) => delay(getMockNotifications(userId));
