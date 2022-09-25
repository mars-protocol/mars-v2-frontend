type Token = {
  symbol: string;
  decimals: number;
  icon: string;
};

const tokenInfo: { [key in string]: Token } = {
  uosmo: {
    symbol: "OSMO",
    decimals: 6,
    icon: "/tokens/osmo.svg",
  },
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": {
    symbol: "ATOM",
    icon: "",
    decimals: 6,
  },
};

export default tokenInfo;
