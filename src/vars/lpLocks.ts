import { LpLockData } from "@/types";
import { apiFetcher } from "@/utils/api";

export let lpLocks: LpLockData[] = [];

export async function setLpLocks() {
  try {
    lpLocks = (
      await apiFetcher<LpLockData[]>("https://api.tonraffles.app/api/v1/lock")
    ).data;
  } catch (error) {
    setLpLocks();
  }
}
