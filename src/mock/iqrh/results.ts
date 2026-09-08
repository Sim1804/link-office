import { Dimension, IqrhWeather, RelationalProfile, type DimensionScore, type ResultatIQRH } from "./types";
import { mockUsers } from "../users";
import { generateResult } from "../utils/generator";
export const mockResults: readonly ResultatIQRH[] = mockUsers.map((user, index) => generateResult(user.id, index));
export const getMockResult = (userId: string): ResultatIQRH | undefined => mockResults.find((result) => result.userId === userId);
