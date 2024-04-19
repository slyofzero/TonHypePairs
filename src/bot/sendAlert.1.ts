import { AGE_THRESHOLD, scoreIcons, scoreTexts } from "@/utils/constants";
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
import { generateHypeScore, getLpLocked } from "@/utils/alert";

export async function sendAlert(pairs: WSSPairData[]) {
  if (!TOKENS_CHANNEL_ID) {
    log("TOKENS_CHANNEL_ID is undefined");
    process.exit(1);
  }

  for (const pair of pairs) {
    const { marketCap, liquidity: cur_liq, pairCreatedAt, baseToken } = pair;
    const { address: tokenAddress, symbol, name } = baseToken;

    const alreadyInHypePairs = hypeNewPairs[tokenAddress];

    const age = moment(pairCreatedAt).fromNow();
    const ageMinutes =
      Number(age.replace("minutes ago", "")) ||
      Number(age.replace("a minutes ago", "1")) ||
      Number(age.replace("a few seconds ago", "1"));

    if (!alreadyInHypePairs) {
      const { pairAddress: address } = pair;

      // Links
      const tokenLink = `https://tonviewer.com/${tokenAddress}`;
      // const pairLink = `https://solscan.io/account/${address}`;
      const dexScreenerLink = `https://dexscreener.com/solana/${address}`;

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
      const info = await client.jettons.getJettonInfo(tokenAddress);
      const { mintable, total_supply, metadata } = info;

      const { decimals } = metadata;
      const totalSupply = Math.floor(Number(total_supply) / 10 ** Number(decimals)); // prettier-ignore
      const holders = await client.jettons.getJettonHolders(tokenAddress);

      const { lpStatus, locked } = await getLpLocked(
        tokenAddress,
        info,
        holders
      );

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

      // Token audit
      const lockStatus = locked > 80 ? "🟩" : "🟥";
      const mintStatus = mintable ? "🟥" : "🟩";
      const mintText = mintable ? "Enabled" : "Disabled";
      const top10HoldStatus = top10Hold < 50 ? "🟩" : "🟥";
      const top10HoldText = top10Hold < 50 ? "less than 50% of total supply" : "greater than 50% of total supply"; // prettier-ignore

      let score = 0;
      if (locked > 80) score += 1;
      if (!mintable) score += 1;
      if (top10Hold < 50) score += 1;

      const scoreText = scoreTexts[score];
      const scoreIcon = scoreIcons[score];
      const scoreIconsText = `${scoreIcon}${scoreIcon}${scoreIcon}`;
      const issues = 3 - score;
      const issuesText = issues > 0 ? "issues" : "issue";
      const hypeScore = generateHypeScore(score);

      // Text
      const text = `Powered By [Ton Hype Alerts](https://t.me/TonHypeAlerts) \\| Hype Alert
      
${hardCleanUpBotMessage(name)} \\| [${hardCleanUpBotMessage(
        symbol
      )}](${tokenLink})

*Hype: ${hypeScore}/100*

Supply: ${cleanUpBotMessage(formatToInternational(totalSupply || 0))}
💰 MCap: $${cleanUpBotMessage(formatToInternational(marketCap))}
🏦 Lp TON: ${liquidity} TON *\\($${liquidityUsd}\\)*
👥 Top 10 Holders: Owns ${cleanUpBotMessage(top10Hold.toFixed(2))}%
👥 Top Holders:
${balancesText}

🧠 Score: ${scoreText} \\(${issues} ${issuesText}\\) ${scoreIconsText}
${mintStatus} Mint: ${mintText}
${lockStatus} LP Status \\- ${lpStatus}
${top10HoldStatus} Top 10 holders ${top10HoldText}

Token Contract:
\`${tokenAddress}\`

🫧 Socials: ${socialsText}
🔗 Links: [DexScreener](${dexScreenerLink}) \\| [TonViewer](${tokenLink})

Powered By [Ton Hype Alerts](https://t.me/TonHypeAlerts)`;

      try {
        const message = await teleBot.api.sendMessage(TOKENS_CHANNEL_ID, text, {
          parse_mode: "MarkdownV2",
          // @ts-expect-error Param not found
          disable_web_page_preview: true,
        });

        hypeNewPairs[tokenAddress] = {
          startTime: now,
          initialMC: marketCap,
          pastBenchmark: 1,
          launchMessage: message.message_id,
        };

        console.log(hypeNewPairs);

        log(`Sent message for ${address} ${name}`);
      } catch (error) {
        log(text);
        errorHandler(error);
      }

      await sleep(5000);
    }
  }
}
