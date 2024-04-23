import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, DEX_URL, HTTP_CLIENT } from "./utils/env";
import { sendAlert } from "./bot/sendAlert";
import { cleanUpHypePairs } from "./bot/cleanUpHypePairs";
import { WebSocket } from "ws";
import { wssHeaders } from "./utils/constants";
import { WSSPairData } from "./types/wssPairsData";
import { getNowTimestamp, getSecondsElapsed } from "./utils/time";
import { Api, HttpClient } from "tonapi-sdk-js";
import { setLpLocks } from "./vars/lpLocks";
import { trackMC } from "./bot/trackMc";

if (!BOT_TOKEN) {
  log("BOT_TOKEN or WSS_URL is missing");
  process.exit(1);
}

export const teleBot = new Bot(BOT_TOKEN);
log("Bot instance ready");

let fetchedAt: number = 0;

if (!DEX_URL) {
  log("DEX_URL is undefined");
  process.exit(1);
}

const httpClient = new HttpClient({
  baseUrl: HTTP_CLIENT,
});
export const client = new Api(httpClient);

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([setLpLocks()]);
  const ws = new WebSocket(DEX_URL, { headers: wssHeaders });

  function connectWebSocket() {
    ws.on("open", function open() {
      log("Connected");
    });

    ws.on("close", function close() {
      log("Disconnected");
      process.exit(1);
    });

    ws.on("error", function error() {
      log("Error");
      process.exit(1);
    });

    ws.on("message", async (event) => {
      const str = event.toString();
      const data = JSON.parse(str);
      const { pairs } = data as { pairs: WSSPairData[] | undefined };
      const lastFetched = getSecondsElapsed(fetchedAt);

      if (pairs && lastFetched > 60) {
        fetchedAt = getNowTimestamp();
        await sendAlert(pairs);
        trackMC();

        cleanUpHypePairs();
      }
    });
  }

  connectWebSocket();
  setInterval(() => {
    setLpLocks();
  }, 5 * 60 * 1e3);
})();
