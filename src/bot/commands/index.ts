import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { sponsor } from "./sponsor";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "sponsor", description: "Add a sponsor text" },
  ]);
  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("sponsor", (ctx) => sponsor(ctx));
  log("Bot commands up");
}
