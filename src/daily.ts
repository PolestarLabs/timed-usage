const DAY = 22 * 60 * 60e3;
const EXPIRE = DAY * 2.1;

import { BaseData, Member, Message, User } from "eris";
import { TranslationOptions } from "i18next";
import { TimedUsage, Req, init as initTimedUsage, STATUS } from "./TimedUsage";
import * as Economy from "../types/Economy"
import { DAILY } from "./utils/Premium";
// @ts-ignore
import Moment from "moment";
import { EventEmitter } from "events";
import { info } from "console";

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

export class Daily extends EventEmitter {
  timedUsage: TimedUsage; user: User | BaseData; dailyPLXMember: Member | null; softStreak!: number; myDaily: DailyValues; userData: any;
  constructor(timedUsage: TimedUsage, user: User | BaseData, dailyPLXMember: Member | null, userData: any) {
    super();
    this.timedUsage = timedUsage; this.user = user; this.dailyPLXMember = dailyPLXMember; this.userData = userData;
    this.myDaily = {
      RBN: 0,
      JDE: 0,
      SPH: 0,
  
      PSM: 0,
      comToken: 0,
      cosmo_fragment: 0,
  
      boosterpack: 0,
      EXP: Math.max(~~(this.timedUsage.userDaily.streak / 2), 10),
  
      stickers: 0,
      evToken: 0,
  
      lootbox_C: 0,
      lootbox_U: 0,
      lootbox_R: 0,
      lootbox_SR: 0,
      lootbox_UR: 0,
    }
  }

  awardPrizes(ECO: typeof Economy, actions: Promise<any>[]) {
    const currencies: ["RBN", "JDE", "SPH", "PSM"] = ["RBN", "JDE", "SPH", "PSM"];
    return Promise.all([...actions,
      ECO.receive(this.user.id, currencies.map((curr) => this.myDaily[curr] ?? 0), "Daily Rewards", currencies),
      DB.users.set(this.user.id, {
        $inc: {
          "modules.exp": this.myDaily.EXP || 0,
          eventTokens: this.myDaily.evToken || 0,
        },
      }),
    ]);
  }

  public async init() {
    const success = async () => {
      // let streak = Number(args[0]||1)
      const { streak } = this.timedUsage.userDaily;
  
      this.softStreak = streak % 10 || 10;
      const is = (x: number) => !(streak % x);
      const isRoadTo = (n: number) => (streak % n) > n - 10;
  
      this.emit("softStreak", this.softStreak);
  
      //
      if (isRoadTo(50) && !is(50)) this.emit("isRoadTo50-isNot50");
      if (isRoadTo(100) && !is(100)) this.emit("isRoadTo100-isNot100");
  
      switch (this.softStreak) {
        case 1: case 2: this.myDaily.RBN += 150; break;
        case 3: this.myDaily.JDE += 1000; break;
        case 4: case 8: this.myDaily.cosmo_fragment += 25; break;
        case 5: this.myDaily.JDE += 1500; break;
        case 6: this.myDaily.lootbox_C += 1; break;
        case 7: this.myDaily.RBN += 350; break;
        case 9: this.myDaily.comToken += 5; break;
      }
      
      if (is(10)) {
        this.myDaily.RBN += 500;
        this.myDaily.JDE += 2500;
        this.myDaily.cosmo_fragment += 35;
        this.myDaily.boosterpack += 1;
        this.myDaily.EXP += 10;
        if (!is(50) && !is(100) && !is(30)) this.myDaily.lootbox_U += 1;
      }
      if (is(30)) {
        this.myDaily.EXP += 10;
        // this.emit("is30");
        this.myDaily.lootbox_R += 1;
      }
      if (is(50)) {
        this.myDaily.EXP += 10;
        this.myDaily.SPH += 1;
        this.emit("is50");
        if (!is(100)) this.myDaily.lootbox_SR += 1;
      }
      if (is(100)) {
        this.myDaily.EXP += 25;
        this.myDaily.SPH += 5;
        this.emit("is100");
        this.myDaily.lootbox_UR += 1;
      }
      if (is(1000)) {
        this.myDaily.EXP += 250;
        this.myDaily.SPH += 10;
      }
      
      if (this.dailyPLXMember?.premiumSince) {
        this.myDaily.PSM = Math.min(~~((Date.now() - new Date(this.dailyPLXMember.premiumSince).getTime()) / (24 * 60 * 60e3) / 10), 150);
        this.emit("guildBooster");
      }
  
      if (this.userData.donator) {
        const donoBoost = DAILY[this.userData.donator as keyof typeof DAILY] || 0;
        this.emit("userDonator", donoBoost);
        this.myDaily.RBN += donoBoost;
      }

      this.emit("calculationComplete", this.myDaily);
    }

    await this.timedUsage.process();
    success()

  
    // Timed.init(msg, "daily", { streak: true, expiration: 1.296e+8 * 1.8 }, after, reject, info);
  }
}
