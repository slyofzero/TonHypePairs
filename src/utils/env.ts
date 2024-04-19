import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  TOKENS_CHANNEL_ID,
  DEX_URL,
  TONCLIENT_API_KEY,
  TONCLIENT_ENDPOINT,
  HTTP_CLIENT,
} = process.env;
