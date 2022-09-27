import tokenInfo from 'config/tokenInfo'

export const getTokenSymbol = (denom: string) => {
  return tokenInfo[denom]?.symbol ?? denom
}

export const getTokenDecimals = (denom: string) => {
  return tokenInfo[denom]?.decimals ?? 6
}
