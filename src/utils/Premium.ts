import { BaseData, User } from "eris";

const baseline = 125;

export enum DAILY {
  antimatter = 500,
  astatine = 100,
  uranium = 75,
  zirconium = 50,
  palladium = 25,
  lithium = 15,
  carbon = 10,
  iridium = 10,
  aluminium = 5,
  plastic = 1,
}

export enum DAILY_GETS {
  antimatter = 1000,
  astatine = 800,
  uranium = 500,
  zirconium = 300,
  palladium = 200,
  lithium = 150,
  carbon = lithium,
  iridium = 100,
  aluminium = 50,
  plastic = 10,
}

export function getTier(user: User | BaseData): Promise<keyof typeof DAILY | null> {
  return DB.users.get(user.id).then((usr: any) => {
    const tier: keyof typeof DAILY = usr.prime?.tier || usr.donator;
    // if (usr.premium?.active)
    return tier?.toLowerCase() || null;
    // return false;
  })
}

export function getDaily(user: User | BaseData): Promise<number> {
  return getTier(user).then((tier) => {
    return baseline + (tier ? DAILY_GETS[tier] : 0)
  })
}
