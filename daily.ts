// @ts-nocheck
const DAY = 22 * 60 * 60e3;
const EXPIRE = DAY * 2.1;

import { Canvas, Image } from "canvas";
import { Member, Message } from "eris";
import { TranslationOptions } from "i18next";
import { TimedUsage, Req, init as initTimedUsage } from ".";
import * as Economy from "./types/Economy"
import Picto from "./types/Picto";
import { DAILY } from "./utils/Premium";
import Moment from "moment";
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

interface v { last: string; next: string; streakcurr: string; expirestr: string };

export class Daily extends EventEmitter {
  public init(
    input: Message | Req,
    constantAssets: Promise<Image | Canvas>[],
    ECO: typeof Economy,
    Picto: Picto,
    dailyPLXMember: Member | null,
    userData: any,
    P: TranslationOptions,
    v: v,
    moment: typeof Moment,
  ) {
    //
    let [boost, expTag, expTagInsu, expTagWARNING, expTagLOST, donoT, super10, prev100, prev30, prev10, soft100, soft30, soft10, soft9, soft8, soft7, soft6, soft5, soft4, soft3, soft2, soft1] = constantAssets;
  
    function awardPrizes(userData: any, myDaily: DailyValues, actions: Promise<any>[]) {
      const currencies: ["RBN", "JDE", "SPH", "PSM"] = ["RBN", "JDE", "SPH", "PSM"];
      return Promise.all([...actions,
        ECO.receive(userData.id, currencies.map((curr) => myDaily[curr]), "Daily Rewards", currencies),
        DB.users.set(userData.id, {
          $inc: {
            "modules.exp": myDaily.EXP || 0,
            eventTokens: myDaily.evToken || 0,
          },
        }),
      ]);
    }
  
    const success = async (inp: Message | Req, dailyInfo: TimedUsage) => {
      // const premiumTier = await Premium.getTier(msg.author);
      // can get just rid of this
      const dailyCard = Picto.new(800, 600);
      const ctx = dailyCard.getContext("2d");
  
      // let streak = Number(args[0]||1)
      const { streak } = dailyInfo.userDaily;
  
      const myDaily = {
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
      };
  
      const softStreak = streak % 10 || 10;
      const is = (x: number) => !(streak % x);
      const isRoadTo = (n: number) => (streak % n) > n - 10;
  
      this.emit("softStreak", softStreak);
      ctx.drawImage(await eval(`soft${softStreak}`), 0, 0);
  
      //
      if (isRoadTo(50) && !is(50)) {
        this.emit("isRoadTo50-isNot50");
        ctx.drawImage(await prev30, 0, 0);
      }
      if (isRoadTo(100) && !is(100)) {
        this.emit("isRoadTo100-isNot100");
        ctx.drawImage(await prev100, 0, 0);
      }
  
      switch (softStreak) {
        case 1: case 2: myDaily.RBN += 150;
        case 3: myDaily.JDE += 1000;
        case 4: case 8: myDaily.cosmo_fragment += 25;
        case 5: myDaily.JDE += 1500;
        case 6: myDaily.lootbox_C += 1;
        case 7: myDaily.RBN += 350;
        case 9: myDaily.comToken += 5;
      }
      
      if (is(10)) {
        myDaily.RBN += 500;
        myDaily.JDE += 2500;
        myDaily.cosmo_fragment += 35;
        myDaily.boosterpack += 1;
        myDaily.EXP += 10;
        if (!is(50) && !is(100) && !is(30)) myDaily.lootbox_U += 1;
      }
      if (is(30)) {
        myDaily.EXP += 10;
        // this.emit("is30");
        // ctx.clearRect(0, 0, 800, 600);
        // ctx.drawImage(soft30,0,0);
        myDaily.lootbox_R += 1;
      }
      if (is(50)) {
        myDaily.EXP += 10;
        myDaily.SPH += 1;
        this.emit("is50");
        ctx.clearRect(0, 0, 800, 600);
        ctx.drawImage(await soft30, 0, 0);
        if (!is(100)) myDaily.lootbox_SR += 1;
      }
      if (is(100)) {
        myDaily.EXP += 25;
        myDaily.SPH += 5;
        this.emit("is100");
        ctx.clearRect(0, 0, 800, 600);
        ctx.drawImage(await soft100, 0, 0);
        myDaily.lootbox_UR += 1;
      }
      if (is(1000)) {
        myDaily.EXP += 250;
        myDaily.SPH += 10;
      }
      
      if (dailyPLXMember?.premiumSince) {
        myDaily.PSM = Math.min(~~((Date.now() - new Date(dailyPLXMember.premiumSince).getTime()) / (24 * 60 * 60e3) / 10), 150);
        this.emit("guildBooster");
        ctx.drawImage(await boost, 0 - 50, 0);
      }
  
      // (apart from RBN += donoBoost)
      if (userData.donator) {
        this.emit("userDonator");
        const donoBoost = DAILY[userData.donator as keyof typeof DAILY] || 0;
        const donoE = Picto.getCanvas(`${paths.CDN}/images/donate/icony/${userData.donator}-small.png`);
        myDaily.RBN += donoBoost;
        const numberDONOBOOST = Picto.tag(ctx, `+ ${donoBoost}`, "italic 900 38px 'Panton Black'", "#FFF", { line: 6, style: "#223" });
        const textDONOBOOST = Picto.tag(ctx, (userData.donator?.toUpperCase() || "UNKNOWN"), "italic 900 15px 'Panton Black'", "#FFF");
  
        const [donoTag, donoEmblem] = await Promise.all([donoT, donoE]);
  
        ctx.drawImage(donoTag, 0, 0);
        ctx.drawImage(numberDONOBOOST.item, 683 - numberDONOBOOST.width, 11);
        ctx.drawImage(textDONOBOOST.item, 668 - textDONOBOOST.width, 53);
        ctx.drawImage(donoEmblem, 698, 14, 52, 52);
      }

      this.emit("calculationComplete", myDaily, dailyInfo, userData);
  
      ctx.save();
      ctx.rotate(0.04490658503988659);
      Picto.popOutTxt(ctx, "Daily Rewards", 60, 40, "italic 900 45px 'Panton Black'", "#FFF", 300, { style: "#1b1b25", line: 12 });
      ctx.restore();
  
      const textStreak = Picto.tag(ctx, "STREAK ", "italic 900 14px 'Panton Black'", "#FFF"); // ,{line: 6, style: "#223"} )
      const textEXP = Picto.tag(ctx, "EXP", "italic 900 18px 'Panton Black'", "#FFF", { line: 6, style: "#223" });
      const numberStreak = Picto.tag(ctx, streak, "italic 900 32px 'Panton Black'", "#FFF"); // ,{line: 6, style: "#223"} )
      const numberStreakPrize = Picto.tag(ctx, myDaily.EXP, "italic 900 38px 'Panton Black'", "#FFF", { line: 6, style: "#223" });
      const numberBoostPrize = Picto.tag(ctx, `+${miliarize(myDaily.PSM)}`, "italic 900 35px 'Panton Black'", "#FFF", { line: 6, style: "#223" });
  
      /// //////////////////////////////////////////////
  
      if (myDaily.PSM) ctx.drawImage(numberBoostPrize.item, 660 - 35, 540);
  
      if (dailyInfo.userDaily.insured) ctx.drawImage(await expTagInsu, 0, 0);
      else if (dailyInfo.streakStatus === "recovered") {
        ctx.drawImage(await expTagWARNING, 0, 0);
        Picto.popOutTxt(ctx,
          $t("Streak insurance activated!", P),
          360, 540,
          "italic 900 35px 'Panton Black'", "#FFF", 400,
          { line: 8, style: "#223" });
      } else if (dailyInfo.streakStatus === "lost") {
        ctx.drawImage(await expTagLOST, 0, 0);
        Picto.popOutTxt(ctx,
          $t("Streak Lost!", P),
          22, 506,
          "italic 900 42px 'Panton Black'", "#FFF", 400,
          { line: 8, style: "#F23" });
      } else ctx.drawImage(await expTag, 0, 0);
  
      if (dailyInfo.streakStatus !== "lost") {
        ctx.rotate(-0.03490658503988659);
        ctx.drawImage(numberStreak.item, 258 - numberStreak.width / 2, 526);
        ctx.drawImage(textStreak.item, 221, 557);
        ctx.drawImage(numberStreakPrize.item, 160 - numberStreakPrize.width, 530);
        ctx.drawImage(textEXP.item, 200 - textEXP.width, 537);
        ctx.rotate(0.03490658503988659);
      }
  
      let lootAction: any = null;
      let boosterAction: any = null;
      let itemAction: any = null;
      let fragAction: any = null;
      let tokenAction: any = null;
  
      const fields = [
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
      ];
      
      for (const i in myDaily) !myDaily[i as keyof typeof myDaily] ? delete myDaily[i as keyof typeof myDaily] : null;
  
      const items = (Object.keys(myDaily) as (keyof typeof myDaily)[]).map((itm, i) => {
        const index = (i) % 2;
  
        P.count = myDaily[itm];
        let itemName = $t(`keywords.${itm}`, P);
        let itemoji = inp instanceof Message ? _emoji!(itm) : void 0;
  
        if (itm.startsWith("lootbox_")) {
          const tier = itm.substr(8);
          lootAction = userData.addItem(`lootbox_${tier}_D`);
          itemName = $t(`items:lootbox_${tier}_D.name`, P);
        }
        if (itm === "boosterpack") {
          const newBooster = async () => {
            const BOOSTERS = await DB.items.find({ type: "booster", rarity: { $in: ["C", "U", "R"] } });
            shuffle(BOOSTERS);
            await userData.addItem(BOOSTERS[0], myDaily[itm]);
          };
          boosterAction = newBooster();
        }
  
        if (itm === "cosmo_fragment") {
          itemName = $t("items:cosmo_fragment.name", P);
          console.log({ myDaily });
          fragAction = userData.addItem("cosmo_fragment", myDaily[itm]);
          itemoji = inp instanceof Message ? _emoji!("COS") : void 0;
        }
  
        // @ts-ignore TODO ask flicky about this
        if (itm === "item") { itemAction = userData.addItem(x); } // for later
  
        if (itm === "comToken") {
          tokenAction = userData.addItem("commendtoken", myDaily[itm]);
          itemName = $t("items:commendtoken.name", P);
        }
  
        if (P.count) fields[index].value += (`${itemoji} **${P.count}** ${itemName}\n`);
        // if(P.count) items.push( `${_emoji(itm)} **${P.count}** ${$t("keywords."+itm,P)}` );
      });
  
      let sq = -10;
      let bar = "";
      while (sq++) {
        if (10 + sq > softStreak) bar += "⬛";
        else bar += "🟦";
      }
      /*
  
          if(DAILY.streakStatus === 'lost' && DAILY.userDaily.lastStreak > 1){
            fields.push({
              name: "\u200b",
              value: "⚠ **Streak Lost**",
              inline: false
            })
          }
  
          /*
  
          */
      let postmortem: string;
      if (dailyInfo.streakStatus === "first") {
        P.insuCount = userData.modules.inventory.find((i: any) => i.id === "keepstreak")?.count || 0;
        postmortem = $t("responses.daily.firstDaily", P);
      }
      if (dailyInfo.streakStatus === "recovered") {
        P.insuCount = userData.modules.inventory.find((i: any) => i.id === "keepstreak")?.count || 0;
        postmortem = $t("responses.daily.insuranceConsumed", P);
      }
      if (dailyInfo.streakStatus === "lost") {
        P.oldStreak = dailyInfo.userDaily.lastStreak;
        const streakfixes = userData.modules.inventory.find((i: any) => i.id === "streakfix")?.count || 0;
        postmortem = `${$t("responses.daily.streakLost", P)}\n${streakfixes ? $t("responses.daily.yesRestorerInfo", P) : $t("responses.daily.noRestorerInfo", P)}`;
      }
  
      // @ts-ignore TODO Ask flicky
      if (dailyInfo.streakStatus?.pass && randomize(0, 5) === 3) {
        fields.push({
          name: "Want to boost your dailies further?",
          value: "Check out the full extra rewards set [**HERE**]" + `(${paths.DASH})`,
          inline: false,
        });
      }
  
      const actions = [lootAction, boosterAction, itemAction, fragAction, tokenAction];
      await awardPrizes(userData, myDaily, actions);
      P.username = inp instanceof Message ? inp.author.username : inp.user.username;
  
      inp instanceof Message && inp.channel.send({
        embed: {
          description: `☕ ${rand$t!("responses.daily.dailyBonus", P)}`,
          fields,
          timestamp: new Date(),
          footer: { icon_url: inp.author.avatarURL, text: `${inp.author.tag}\u2002•  ${bar}` },
          color: 0x03dffc,
          image: { url: "attachment://daily.png" },
        },
      }, { file: dailyCard.toBuffer("image/png"), name: "daily.png" }).then((x) => {
        if (postmortem) {
          inp.channel.send(postmortem);
        }
      });
  
      const info = async (msg: Message | Req, Daily: TimedUsage) => {
        const { userDaily } = Daily;
        const dailyAvailable = Daily.dailyAvailable();
        const streakGoes = Daily.keepStreak();
        const { streak } = userDaily;
  
        const powerups = [];
        if (dailyPLXMember?.premiumSince) powerups.push(_emoji!("PSM"));
        if (userData.donator) powerups.push(_emoji!(userData.donator));
  
        const embed = {
          color: 0xE34555,
          title: "Daily Status",
          description: `${_emoji!("time")} ${_emoji!("offline")} **${v.last}** ${moment.utc(userDaily.last).fromNow()}\n`
          + `${_emoji!("future")} ${dailyAvailable ? _emoji!("online") : _emoji!("dnd")} **${v.next}** ${moment.utc(userDaily.last).add(DAY / 60e3, "minutes").fromNow()}\n`
          + `${_emoji!("expired")} ${streakGoes ? _emoji!("online") : _emoji!("dnd")} **${v.expirestr}** ${streakGoes
            ? ` ${moment.duration(-(Date.now() - userDaily.last - (Daily.expiration || 0))).humanize({ h: 1000 })}!`
            : "I have bad news for you..."}\n${_emoji!("expense")} ${_emoji!("offline")} **${v.streakcurr}** \`${streak}x\``,
          fields: [
            {
              name: "Powerups",
              value: powerups.join(" • ") || "None",
              inline: !0,
            },
            {
              name: "Insurance",
              value: Daily.userDaily.insured ? _emoji!("yep") : _emoji!("nope"),
              inline: !0,
            },
          ],
          footer: { icon_url: (msg as Message).author.avatarURL, text: `${(msg as Message).author.tag}\u2002` },
        }
        // @ts-expect-error pollux emoji extending string
        return msg.channel.send({ embed });
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
}
