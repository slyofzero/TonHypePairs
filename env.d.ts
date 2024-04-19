declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      TOKENS_CHANNEL_ID: string | undefined;
      DEX_URL: string | undefined;
      TONCLIENT_ENDPOINT: string | undefined;
      TONCLIENT_API_KEY: string | undefined;
      HTTP_CLIENT: string | undefined;
    }
  }
}

export {};
