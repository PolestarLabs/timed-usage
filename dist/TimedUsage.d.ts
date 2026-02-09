import { User, BaseData, Member } from "eris";
interface UserDaily {
    streak: number;
    highest: number;
    insured?: boolean;
    lastStreak?: number;
    last: number;
}
interface TimedUsageOptions {
    day?: number;
    streak?: boolean | null;
    expiration?: number;
    precheck?: () => boolean | Promise<boolean>;
}
export declare enum STATUS {
    lost = 0,
    first = 1,
    pass = 2,
    recovered = 3
}
type StreakStatus = "first" | "pass" | "recovered" | "lost";
export declare class TimedUsage {
    user: User | BaseData;
    command: string;
    day: number;
    expiration: number | null;
    streak: boolean | null;
    userDaily: UserDaily;
    userData: any;
    userDataStatic?: number;
    insuranceUsed?: boolean;
    streakStatus?: StreakStatus;
    precheck: () => boolean | Promise<boolean>;
    constructor(command: string, options: TimedUsageOptions);
    loadUser(user: Member | User | BaseData): Promise<this>;
    process(): Promise<STATUS | null>;
    get available(): boolean;
    get keepStreak(): boolean | null;
    get availableAt(): number;
    get streakExpiresAt(): number | null;
    streakProcess(streakContinues: boolean | null, user: User | BaseData): Promise<"first" | "pass" | "recovered" | "lost">;
}
export {};
//# sourceMappingURL=TimedUsage.d.ts.map