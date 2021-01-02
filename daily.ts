// @ts-nocheck
const DAY = 22 * 60 * 60e3;
const EXPIRE = DAY * 2.1;

import { BaseData, Member, Message } from "eris";
import { TranslationOptions } from "i18next";
import { TimedUsage, Req, init as initTimedUsage } from ".";
import * as Economy from "./types/Economy"
import { DAILY } from "./utils/Premium";
import Moment from "moment";
import { EventEmitter } from "events";

export class Daily extends EventEmitter {
  timedUsage: TimedUsage; user: User | BaseData; dailyPLXMember: Member | null; myDaily = {
    RBN: 0,
    JDE: 0,
    SPH: 0,

    PSM: 0,
    comToken: 0,
    cosmo_fragment: 0,

    boosterpack: 0,
    EXP: Math.max(~~(streak / 2), 10),

    stickers: 0,
    evToken: 0,

    lootbox_C: 0,
    lootbox_U: 0,
    lootbox_R: 0,
    lootbox_SR: 0,
    lootbox_UR: 0,
  }
  constructor(timedUsage: TimedUsage, user: User | BaseData, dailyPLXMember: Member | null) {
    super();
    this.timedUsage = timedUsage; this.user = user; this.dailyPLXMember = dailyPLXMember;
  }

  awardPrizes(ECO: typeof Economy, actions: Promise<any>[]) {
    const currencies: ["RBN", "JDE", "SPH", "PSM"] = ["RBN", "JDE", "SPH", "PSM"];
    return Promise.all([...actions,
      ECO.receive(this.userData.id, currencies.map((curr) => this.myDaily[curr]), "Daily Rewards", currencies),
      DB.users.set(this.userData.id, {
        $inc: {
          "modules.exp": this.myDaily.EXP || 0,
          eventTokens: this.myDaily.evToken || 0,
        },
      }),
    ]);
  }

  public init(
    input: Message | Req,
    P: TranslationOptions,
    moment: typeof Moment,
  ) {
  
    const success = async () => {
      // let streak = Number(args[0]||1)
      const { streak } = this.timedUsage.userDaily;
  
      const softStreak = streak % 10 || 10;
      const is = (x: number) => !(streak % x);
      const isRoadTo = (n: number) => (streak % n) > n - 10;
  
      this.emit("softStreak", softStreak);
  
      //
      if (isRoadTo(50) && !is(50)) this.emit("isRoadTo50-isNot50");
      if (isRoadTo(100) && !is(100)) this.emit("isRoadTo100-isNot100");
  
      switch (softStreak) {
        case 1: case 2: this.myDaily.RBN += 150;
        case 3: this.myDaily.JDE += 1000;
        case 4: case 8: this.myDaily.cosmo_fragment += 25;
        case 5: this.myDaily.JDE += 1500;
        case 6: this.myDaily.lootbox_C += 1;
        case 7: this.myDaily.RBN += 350;
        case 9: this.myDaily.comToken += 5;
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
  
      // (apart from RBN += donoBoost)
      if (this.userData.donator) {
        const donoBoost = DAILY[this.userData.donator as keyof typeof DAILY] || 0;
        this.emit("userDonator", donoBoost);
        this.myDaily.RBN += donoBoost;
      }

      this.emit("calculationComplete", this.myDaily);
    }
  
    const reject = (message: Message | Req, D: TimedUsage, REM: number) => {
      P.remaining = moment.utc(REM).fromNow(true);
      return (message as Message).channel.send(_emoji!("nope") + $t("responses.daily.dailyNope", P));
    }

    initTimedUsage(
      input,
      "daily",
      { day: DAY, expiration: EXPIRE, streak: true },
      success, reject, info,
    );
  
    // Timed.init(msg, "daily", { streak: true, expiration: 1.296e+8 * 1.8 }, after, reject, info);
  }
}
