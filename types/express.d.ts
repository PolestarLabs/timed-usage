import { BaseData } from "eris";

declare module "express-serve-static-core" {
  interface Request {
    user: BaseData;
  }
}