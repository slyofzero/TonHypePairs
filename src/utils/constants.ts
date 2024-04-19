export const VOLUME_THRESHOLD = 7000;
export const LIQUIDITY_THRESHOLD = 5;
export const CHECK_INTERVAL = 5 * 60;
export const CLEANUP_INTERVAL = 30;
export const MAX_START_TIME = 60 * 10;
export const AGE_THRESHOLD = 10;
export const DEAD_ADDRESS =
  "0:0000000000000000000000000000000000000000000000000000000000000000";

export const wssHeaders = {
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  Upgrade: "websocket",
  Origin: "https://dexscreener.com",
  "Sec-WebSocket-Version": "13",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  "Sec-WebSocket-Key": "08ihcFbLdi17Qcysugzvdw==",
  "Sec-WebSocket-Extensions": "permessage-deflate",
};

export const scoreIcons: { [key: number]: string } = {
  3: "🟢",
  2: "🟡",
  1: "🟡",
  0: "🔴",
};
export const scoreTexts: { [key: number]: string } = {
  3: "Very Good",
  2: "Good",
  1: "Good",
  0: "Bad",
};
