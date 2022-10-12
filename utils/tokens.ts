import tokenInfo from 'config/tokenInfo'

export const getTokenSymbol = (denom: string) => {
  return tokenInfo[denom]?.symbol ?? denom
}

export const getTokenDecimals = (denom: string) => {
  return tokenInfo[denom]?.decimals ?? 6
}

export const getTokenIcon = (denom: string) => {
  return tokenInfo[denom].icon
}

export const getTokenInfo = (denom: string) => {
  return tokenInfo[denom]
}
