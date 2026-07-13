import { fakeIdentity } from "../utils/faker";
import { range } from "../utils/random";

export enum UserRole { User = "user", Admin = "admin", Partner = "partner" }
export enum SubscriptionType { Freemium = "freemium", Premium = "premium" }
export interface User { id: string; firstName: string; lastName: string; email: string; age: number; profession: string; city: string; department: string; avatar: string; role: UserRole; subscription: SubscriptionType; }

export const mockUsers: readonly User[] = range(100).map((index) => ({ id: `usr_${String(index + 1).padStart(3, "0")}`, ...fakeIdentity(index), role: index === 0 ? UserRole.Admin : UserRole.User, subscription: index % 3 === 0 ? SubscriptionType.Premium : SubscriptionType.Freemium }));
export const getMockUser = (id: string): User | undefined => mockUsers.find((user) => user.id === id);
