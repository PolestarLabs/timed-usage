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
    if (!this.dailyAvailable && PLX.timerBypass?.includes(this.id) === false) {
      this.userDataStatic = this.userDaily.last;
      throw new Error("On cooldown");
    };
    if (!(await this.precheck())) return null;
    this.user.dailing = true;
    await wait(0.2);

    const now = Date.now();
    DB.users.set(this.user.id, { $set: { [`counters.${this.command}.last`]: now } });
    this.streakStatus = await this.streakProcess(this.keepStreak, this.user);

    if (this.streak && this.streakStatus !== "lost") {
      if (this.streakStatus === "recovered") this.insuranceUsed = true;
      DB.users.set(this.user.id, { $inc: { [`counters.${this.command}.streak`]: 1 } });
    } else if (this.streak && this.streakStatus === "lost") {
      DB.users.set(this.user.id, { $set: { [`counters.${this.command}.streak`]: 1 } });
    }

    return STATUS[this.streakStatus]; // success
  }

  /** @deprecated */
  async parseUserData(user: User | BaseData) {
    const USERDATA = await DB.users.get({ id: user.id }, undefined, "users");
    const userDaily = USERDATA.counters?.[this.command] || { last: 1, streak: 1 };
    this.userDaily = userDaily;
    return this.userDaily;
  }

  /** @deprecated */
  userData(user: User) {
    return this.parseUserData(user); // COMPATIBILITY
  }

  get dailyAvailable() {
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
type Callback<T> = (input: T, Daily: TimedUsage, remaining: number) => any;
export type Req = Request<ParamsDictionary, any, any, qs.ParsedQs>;

/** @deprecated */
// @ts-ignore
export async function init(user: User | BaseData, cmd: string, opts: TimedUsageOptions, success: Callback<T>, reject: Callback<T>, info?: Callback<T>, presuccess?: Callback<T>): Promise<any> {
  // const P = input instanceof Message ? { lngs: input.lang } : void 0;
  // const lang = input instanceof Message ? input.lang[0] : void 0;
  // moment.locale(lang);

  const Daily = new TimedUsage(cmd, opts);
  /*
  const v = {
    last: $t("interface.daily.lastdly", P),
    next: $t("interface.daily.next", P),
    streakcurr: $t("interface.daily.streakcurr", P),
    expirestr: $t("interface.daily.expirestr", P),
  };
  */

  // if (input instanceof Message && user.dailing === true) return input.channel.send(`There's already a \`${Daily.command}\` request going on!`);

  const DAY = Daily.day;
  await Daily.parseUserData(user);
  const userDaily = Daily.userDaily.last || Date.now();
  const dailyAvailable = Daily.dailyAvailable;

  /* info/stats/status
  if (input instanceof Message && (input.args.includes("status") || input.args.includes("stats") || input.args.includes("info"))) {
    const remain = userDaily + DAY;
    if (info) return info(input, Daily, remain);
    const embed = new Embed();
    embed.setColor("#e35555");
    embed.description(`${_emoji?.("time")} ${_emoji?.("offline")} **${v.last}** ${moment.utc(userDaily).fromNow()}\n`
      + `${_emoji?.("future")} ${dailyAvailable ? _emoji?.("online") : _emoji?.("dnd")} **${v.next}** `
      + `${moment.utc(userDaily).add((DAY / 1000 / 60 / 60), "hours").fromNow()}`); // @ts-ignore fuckin eris additions
    return input.channel.send({ embed });
  }
  */

  const remain = userDaily + DAY;
  // @ts-expect-error: timerBypass is only available on bot instance - will be undefined otherwise
  if (!dailyAvailable && (!PLX.timerBypass?.includes(user.id))) {
    Daily.userDataStatic = userDaily;
    return reject(user, Daily, remain);
  }
  if (presuccess) {
    const pre = await presuccess(user, Daily, remain);
    if (pre !== true) return null;
  }

  user.dailing = true;
  await wait(0.2);
  const now = Date.now();
  DB.users.set(user.id, { $set: { [`counters.${Daily.command}.last`]: now } });
  const streakStatus = await Daily.streakProcess(Daily.keepStreak, user);

  if (Daily.streak && streakStatus !== "lost") {
    if (streakStatus === "recovered") Daily.insuranceUsed = true;
    DB.users.set(user.id, { $inc: { [`counters.${Daily.command}.streak`]: 1 } });
  } else if (Daily.streak && streakStatus === "lost") {
    DB.users.set(user.id, { $set: { [`counters.${Daily.command}.streak`]: 1 } });
  }
  Daily.streakStatus = streakStatus;

  success(user, Daily, remain);

  user.dailing = false;
  return null;
}