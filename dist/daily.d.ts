/// <reference types="node" />
import { BaseData, Member, User } from "eris";
import { TimedUsage } from "./TimedUsage";
import * as Economy from "../types/Economy";
import { EventEmitter } from "events";
interface DailyValues {
    RBN: number;
    JDE: number;
    SPH: number;
    PSM: number;
    comToken: number;
    cosmo_fragment: number;
    boosterpack: number;
    EXP: number;
    stickers: number;
    evToken: number;
    lootbox_C: number;
    lootbox_U: number;
    lootbox_R: number;
    lootbox_SR: number;
    lootbox_UR: number;
}
export declare class Daily extends EventEmitter {
    timedUsage: TimedUsage;
    dailyPLXMember: Member | null;
    softStreak: number;
    myDaily: DailyValues;
    constructor(timedUsage: TimedUsage, dailyPLXMember: Member | null);
    static load(user: Member | User | BaseData): Promise<Daily>;
    awardPrizes(ECO: typeof Economy, actions: Promise<any>[]): Promise<[...any[], any, any]>;
    init(): Promise<void>;
}
export {};
//# sourceMappingURL=daily.d.ts.map