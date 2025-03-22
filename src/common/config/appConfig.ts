import { registerAs } from "@nestjs/config";
import { configNames } from "../constants/configNames";

export interface IAppConfig {
  port: number;
  db: string;
  openAi: string;
  graphQl: string;
  privyId: string;
  privySecret: string;
}

export default registerAs(configNames.APP, () => {
  const port = process.env.PORT ? +process.env.PORT : 5001;
  const db = process.env.DATABASE_URL as string;
  const openAi = process.env.OPENAI_API_KEY as string;
  const graphQl =
    "https://api.studio.thegraph.com/query/107388/block-mentor/version/latest";

  const privyId = process.env.PRIVY_APP_ID as string
  const privySecret = process.env.PRIVY_APP_SECRET as string

  const config: IAppConfig = {
    port: port,
    db,
    openAi,
    graphQl,
    privyId,
    privySecret
  };
  return config;
});
