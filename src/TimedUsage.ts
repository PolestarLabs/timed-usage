import { User, BaseData } from "eris";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core"

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

export enum STATUS {
  lost,
  first,
  pass,
  recovered,
}

type StreakStatus = "first" | "pass" | "recovered" | "lost"

export class TimedUsage {
  user!: User | BaseData;
  command: string;
  day: number;
  expiration: number | null;
  streak: boolean | null;
  userDaily!: UserDaily;
  userDataStatic?: number;
  insuranceUsed?: boolean;
  streakStatus?: StreakStatus;
  precheck: () => boolean | Promise<boolean> = () => true;
  constructor(command: string, options: TimedUsageOptions) {
    this.command = command;
    this.day = options.day || 7.2e+7;
    this.expiration = options.expiration || null;
    this.streak = options.streak === void 0 ? null : options.streak;
    if (options.precheck) this.precheck = options.precheck;
  }

  async loadUser(user: User | BaseData) {
    const USERDATA = await DB.users.get({ id: user.id }, undefined, "users");
    const userDaily = USERDATA?.counters?.[this.command] || { last: 1, streak: 1 };
    this.userDaily = userDaily;
    this.user = user;
    return this;
  }

  async process() {
    if (!this.userDaily) throw new Error("User not loaded");
    // @ts-ignore
    if (!this.available && PLX.timerBypass?.includes(this.id) === false) {
      this.userDataStatic = this.userDaily.last;
      throw new Error("On cooldown");
    };
    if (!(await this.precheck())) return null;
    this.user.dailing = true;
    await wait(0.2);

    const now = Date.now();
    await DB.users.set(this.user.id, { $set: { [`counters.${this.command}.last`]: now } });
    this.streakStatus = await this.streakProcess(this.keepStreak, this.user);

    if (this.streak && this.streakStatus !== "lost") {
      if (this.streakStatus === "recovered") this.insuranceUsed = true;
      await DB.users.set(this.user.id, { $inc: { [`counters.${this.command}.streak`]: 1 } });
    } else if (this.streak && this.streakStatus === "lost") {
      await DB.users.set(this.user.id, { $set: { [`counters.${this.command}.streak`]: 1 } });
    }

    return STATUS[this.streakStatus]; // success
  }

  get available() {
    const now = Date.now();
    const { userDaily } = this;
    return now - (userDaily.last || 0) >= this.day;
  }

  get keepStreak() {
    if (this.streak === null) return null;
    const now = Date.now();
    const { userDaily } = this; // @ts-ignore
    return now - (userDaily.last || 0) <= this.expiration;
  }

  get availableAt() {
    return this.userDaily.last + this.day;
  }

  get streakExpiresAt() {
    return this.expiration && this.userDaily.last + this.expiration;
  }

  async streakProcess(streakContinues: boolean | null, user: User | BaseData) {
    if (streakContinues === null) return "pass";
    if (streakContinues) {
      if (this.userDaily.streak > (this.userDaily.highest || 1)) await DB.users.set(user.id, { [`counters.${this.command}.highest`]: this.userDaily.streak });
      if (this.userDaily.streak === 1) return "first";
      return "pass";
    }
    if (this.userDaily.insured) {
      await DB.users.set(user.id, { [`counters.${this.command}.insured`]: false });
      this.userDaily.insured = false;
      return "recovered";
    }
    await DB.users.set(user.id, { [`counters.${this.command}.lastStreak`]: this.userDaily.streak });
    this.userDaily.lastStreak = this.userDaily.streak;
    this.userDaily.streak = 1;
    return "lost";
  }
}
export type Req = Request<ParamsDictionary, any, any, qs.ParsedQs>;
