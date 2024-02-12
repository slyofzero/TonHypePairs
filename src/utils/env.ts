import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  DATA_URL,
  PHOTON_COOKIE,
  RPC_ENDPOINT,
  BURN_CHANNEL_ID,
  TOKENS_CHANNEL_ID,
} = process.env;
