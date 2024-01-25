export default async function getWalletBalances(
  chainConfig: ChainConfig,
  address: string,
): Promise<Coin[]> {
  const uri = '/cosmos/bank/v1beta1/balances/'

  const response = await fetch(`${chainConfig.endpoints.rest}${uri}${address}`)

  if (response.ok) {
    const data = await response.json()
    return data.balances
  }

  return new Promise((_, reject) => reject('No data'))
}
