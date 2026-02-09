import { BaseData, User } from "eris";
export declare enum DAILY {
    antimatter = 500,
    astatine = 100,
    uranium = 75,
    zirconium = 50,
    palladium = 25,
    lithium = 15,
    carbon = 10,
    iridium = 10,
    aluminium = 5,
    plastic = 1
}
export declare enum DAILY_GETS {
    antimatter = 1000,
    astatine = 800,
    uranium = 500,
    zirconium = 300,
    palladium = 200,
    lithium = 150,
    carbon = 150,
    iridium = 100,
    aluminium = 50,
    plastic = 10
}
export declare function getTier(user: User | BaseData): Promise<keyof typeof DAILY | null>;
export declare function getDaily(user: User | BaseData): Promise<number>;
//# sourceMappingURL=Premium.d.ts.map