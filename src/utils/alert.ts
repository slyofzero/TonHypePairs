import { Address } from "@ton/ton";
import { DEAD_ADDRESS } from "./constants";
import { JettonHolders, JettonInfo } from "tonapi-sdk-js";
import { lpLocks } from "@/vars/lpLocks";

export async function getLpLocked(
  token: string,
  info: JettonInfo,
  holders: JettonHolders
) {
  const tokenAddress = Address.parse(token).toString();
  const { total_supply, metadata } = info;
  const { decimals } = metadata;

  const lpBurnt =
    holders.addresses.find(({ owner }) => owner.address === DEAD_ADDRESS)
      ?.balance || 0;
  const lpBurntPercentage = Math.floor(
    (Number(lpBurnt) / Number(total_supply)) * 100
  );

  const tokenLp = lpLocks.find(({ token }) => token.address === tokenAddress);
  const lpLocked = tokenLp?.amount || 0;

  const totalSupply = Math.floor(Number(total_supply) / 10 ** Number(decimals)); // prettier-ignore
  const lpLockedPercentage = Math.floor((lpLocked / totalSupply) * 100);
  const totalLocked = lpBurntPercentage + lpLockedPercentage;

  const lpLockText = [`${totalLocked}% locked`];
  if (lpBurntPercentage > 0) lpLockText.push(`${lpBurntPercentage}% burnt`);
  if (lpLockedPercentage > 0) {
    const tonRafflesText = `[TonRaffles](https://tonraffles.app/lock/${tokenAddress})`;
    lpLockText.push(`${lpLockedPercentage}% locked at ${tonRafflesText}`);
  }

  return { lpStatus: lpLockText.join("\n\t\t\t\t\t\t"), locked: totalLocked };
}

export function generateHypeScore(score: number) {
  if (score < 0 || score > 3 || !Number.isInteger(score)) {
    throw new Error("Score must be an integer between 0 and 3.");
  }

  // Define the base range
  let min = 30;
  let max = 50;

  // Adjust the range based on the score
  if (score === 1) {
    min = 50;
    max = 65;
  } else if (score === 2) {
    min = 60;
    max = 80;
  } else if (score === 3) {
    min = 80;
    max = 95;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
