import { hardCleanUpBotMessage } from "@/utils/bot";
import { TOKENS_CHANNEL_ID } from "@/utils/env";
import { client, teleBot } from "..";
import { hypeNewPairs } from "@/vars/tokens";
import { errorHandler, log } from "@/utils/handlers";
import { WSSPairData } from "@/types/wssPairsData";
import { getLpLocked } from "@/utils/alert";
import { sleep } from "@/utils/time";

export async function trackLpLock(pair: WSSPairData) {
  try {
    if (!TOKENS_CHANNEL_ID) {
      log("TOKENS_CHANNEL_ID is undefined");
      process.exit(1);
    }

    const { pairAddress: address, baseToken } = pair;
    const { address: tokenAddress, symbol } = baseToken;

    const holders = await client.jettons.getJettonHolders(tokenAddress);
    const info = await client.jettons.getJettonInfo(tokenAddress);

    const { locked: lp_burned_perc } = await getLpLocked(
      tokenAddress,
      info,
      holders
    );
    const { lpStatus, launchMessage, ...rest } = hypeNewPairs[tokenAddress];
    const isLpStatusOkay = lp_burned_perc > 80;

    if (!lpStatus && isLpStatusOkay) {
      hypeNewPairs[tokenAddress] = {
        lpStatus: true,
        launchMessage,
        ...rest,
      };

      // Links
      const tokenLink = `https://tonviewer.com/${tokenAddress}`;
      const dexScreenerLink = `https://dexscreener.com/ton/${address}`;

      const text = `Powered By [Ton Hype Alerts](https://t.me/TonHypeAlerts)
      
[${hardCleanUpBotMessage(symbol)}](${tokenLink}) LP tokens locked 🔥🔥🔥 

[DexScreener](${dexScreenerLink}) \\| [TonViewer](${tokenLink})`;

      teleBot.api
        .sendMessage(TOKENS_CHANNEL_ID, text, {
          parse_mode: "MarkdownV2",
          // @ts-expect-error Param not found
          disable_web_page_preview: true,
          reply_parameters: { message_id: launchMessage },
        })
        .then(() => log(`Sent message for ${address}`))
        .catch((e) => {
          log(text);
          errorHandler(e);
        });

      await sleep(5000);
    }
  } catch (error) {
    errorHandler(error);
  }
}
