import { BaseData } from "eris";

type ArrayValuesUnion<T extends Array> = (T)[keyof T extends number ? keyof T : never];
type Currencies = ArrayValuesUnion<typeof currencies>;

export declare const currencies: [
  "RBN", "JDE", "SPH",
  "AMY", "EMD", "TPZ", "PSM"
];

export declare function arbitraryAudit(
  from: string | BaseData,
  to: string | BaseData,
  amt?: number,
  type?: string, // Should this be strict typed?
  tag?: string,
  symbol?: string,
): Promise<object | null>;

export declare function checkFunds(
  user: string | BaseData,
  amount: number | number[],
  currency?: Currencies | Currencies[],
): Promise<boolean>;

export declare function generatePayload(
  userFrom: string | BaseData,
  userTo: string | BaseData,
  amt: number,
  type: string,
  curr: Currencies,
  subtype: string,
  symbol: string,
): Promise<object>;

export declare function parseCurrencies<C extends Currencies | Currencies[]>(
  curr: C,
): C;

export declare function pay(
  user: string | BaseData,
  amt: 0,
  type?: string,
  currency?: Currencies,
): Promise<null>;
export declare function pay(
  user: string | BaseData,
  amt: 0[],
  type?: string,
  currency?: Currencies[],
): Promise<null>;
export declare function pay(
  user: string | BaseData,
  amt: number,
  type?: string,
  currency?: Currencies,
): Promise<object>;
export declare function pay(
  user: string | BaseData,
  amt: number[],
  type?: string,
  currency?: Currencies[],
): Promise<object[]>;

export declare function receive(
  user: string | BaseData,
  amt: 0,
  type?: string,
  currency?: Currencies,
): Promise<null>;
export declare function receive(
  user: string | BaseData,
  amt: 0[],
  type?: string,
  currency?: Currencies[],
): Promise<null>;
export declare function receive(
  user: string | BaseData,
  amt: number,
  type?: string,
  currency?: Currencies,
): Promise<object>;
export declare function receive(
  user: string | BaseData,
  amt: number[],
  type?: string,
  currency?: Currencies[],
): Promise<object[]>;

export declare function transfer(
  userFrom: string | BaseData,
  userTo: string | BaseData,
  amt: 0,
  type?: string,
  curr?: Currencies,
  subtype?: string,
  symbol?: string,
): Promise<null>;
export declare function transfer(
  userFrom: string | BaseData,
  userTo: string | BaseData,
  amt: 0[],
  type?: string,
  curr?: Currencies[],
  subtype?: string,
  symbol?: string,
): Promise<null>;
export declare function transfer(
  userFrom: string | BaseData,
  userTo: string | BaseData,
  amt: number,
  type?: string,
  curr?: Currencies,
  subtype?: string,
  symbol?: string,
): Promise<object>;
export declare function transfer(
  userFrom: string | BaseData,
  userTo: string | BaseData,
  amt: number[],
  type?: string,
  curr?: Currencies[],
  subtype?: string,
  symbol?: string,
): Promise<object[]>;