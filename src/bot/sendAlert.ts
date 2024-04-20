import { AGE_THRESHOLD } from "@/utils/constants";
import { formatToInternational } from "@/utils/general";
import { hypeNewPairs } from "@/vars/tokens";
import { client, teleBot } from "..";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { TOKENS_CHANNEL_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import moment from "moment";
import { WSSPairData } from "@/types/wssPairsData";
import { Address } from "@ton/ton";
import { sleep } from "@/utils/time";
import { getLpLocked } from "@/utils/alert";

export async function sendAlert(pairs: WSSPairData[]) {
  if (!TOKENS_CHANNEL_ID) {
    log("TOKENS_CHANNEL_ID is undefined");
    process.exit(1);
  }

  for (const pair of pairs) {
    try {
      const {
        marketCap,
        liquidity: cur_liq,
        pairCreatedAt,
        baseToken,
        dexId,
      } = pair;
      const { address: tokenAddress, symbol, name } = baseToken;

      const alreadyInHypePairs = hypeNewPairs[tokenAddress];

      const age = moment(pairCreatedAt).fromNow();
      const ageMinutes =
        Number(age.replace("minutes ago", "")) ||
        Number(age.replace("a minutes ago", "1")) ||
        Number(age.replace("a few seconds ago", "1"));

      if (
        !alreadyInHypePairs &&
        ageMinutes <= AGE_THRESHOLD &&
        cur_liq.quote > 50
      ) {
        const { pairAddress: address } = pair;

        // Links
        const tokenLink = `https://tonviewer.com/${tokenAddress}`;
        const dexScreenerLink = `https://dexscreener.com/ton/${address}`;

        const now = Math.floor(Date.now() / 1e3);
        const socialsText = "No links available";

        // Token Info
        const liquidity = cleanUpBotMessage(
          formatToInternational(cur_liq.quote.toFixed(2))
        );
        const liquidityUsd = cleanUpBotMessage(
          formatToInternational(cur_liq.usd)
        );

        // Holders info
        const holders = await client.jettons.getJettonHolders(tokenAddress);
        const info = await client.jettons.getJettonInfo(tokenAddress);
        const { mintable, total_supply, metadata } = info;

        const { decimals } = metadata;
        const totalSupply = Math.floor(Number(total_supply) / 10 ** Number(decimals)); // prettier-ignore

        const { lpStatus } = await getLpLocked(tokenAddress, info, holders);

        let top10Hold = 0;
        const balancesText = holders.addresses
          .slice(0, 10)
          .map((holder) => {
            const address = Address.parse(holder.owner.address).toString();
            const balance = Number(holder.balance);

            if (balance && total_supply) {
              const held = ((balance / Number(total_supply)) * 100).toFixed(2);
              top10Hold += parseFloat(held);
              const percHeld = cleanUpBotMessage(held);
              return `[${percHeld}%](https://tonviewer.com/${address})`;
            }
          })
          .slice(0, 5)
          .join(" \\| ");

        if (top10Hold > 100) top10Hold = 100;

        const mintText = mintable ? "Enabled" : "Disabled";

        // Text
        const text = `Powered By [Ton Hype Alerts](https://t.me/TonHypeAlerts) \\| Hype Alert
      
${hardCleanUpBotMessage(name)} \\| [${hardCleanUpBotMessage(
          symbol
        )}](${tokenLink})

Supply: ${cleanUpBotMessage(formatToInternational(totalSupply || 0))}
⌚ Age: ${age}
💰 MCap: $${cleanUpBotMessage(formatToInternational(marketCap))}
🏦 Liquidity: ${liquidity} TON *\\($${liquidityUsd}\\)*
👥 Top 10 Holders: Own ${cleanUpBotMessage(top10Hold.toFixed(2))}%
👥 Top Holders:
${balancesText}

Mint \\- ${mintText}
LP Status \\- ${lpStatus}
Dex \\- \`${dexId}\`

Token Contract:
\`${tokenAddress}\`

📊 [Chart](${dexScreenerLink})
🫧 Socials: ${socialsText}
🔗 Links: [DexScreener](${dexScreenerLink}) \\| [TonViewer](${tokenLink})

Powered By [Ton Hype Alerts](https://t.me/TonHypeAlerts)`;

        try {
          const message = await teleBot.api.sendMessage(
            TOKENS_CHANNEL_ID,
            text,
            {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Param not found
              disable_web_page_preview: true,
            }
          );

          hypeNewPairs[tokenAddress] = {
            startTime: now,
            initialMC: marketCap,
            pastBenchmark: 1,
            launchMessage: message.message_id,
          };

          log(`Sent message for ${address} ${name}`);
          await sleep(5000);
        } catch (error) {
          log(text);
          errorHandler(error);
        }
      }
    } catch (error) {
      errorHandler(error);
      await sleep(3000);
    }
  }
}
