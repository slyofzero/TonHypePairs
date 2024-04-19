interface Token {
  address: string;
  img: string;
  symbol: string;
  name: string;
  decimals: number;
}

export interface LpLockData {
  id: number;
  address: string;
  owner: string;
  amount: number;
  firstpayout: number;
  interval: string;
  nextpayouts: string;
  token: Token;
  locktime: string;
  title: string;
  created: string;
  isactive: boolean;
}
