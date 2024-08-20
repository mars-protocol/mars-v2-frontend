import { ChainInfoID } from 'types/enums'

export default async function getGasPrice(chainConfig: ChainConfig) {
  if (!chainConfig.endpoints.gasPrices) return chainConfig.gasPrice
  const isOsmosis = chainConfig.id === ChainInfoID.Osmosis1

  if (isOsmosis) {
    try {
      const uri = new URL(chainConfig.endpoints.gasPrices)
      const gasPrice = await fetch(uri.toString()).then(async (res) => {
        const data = (await res.json()) as { base_fee: string }
        return data.base_fee
      })
      return `${gasPrice}${chainConfig.defaultCurrency.coinMinimalDenom}`
    } catch (e) {
      console.error(e)
      return chainConfig.gasPrice
    }
  } else {
    try {
      const uri = new URL(chainConfig.endpoints.gasPrices, chainConfig.endpoints.rest)
      const gasPrice = await fetch(uri.toString()).then(async (res) => {
        const data = (await res.json()) as { price: Coin }
        return data.price.amount
      })
      return `${gasPrice}${chainConfig.defaultCurrency.coinMinimalDenom}`
    } catch (e) {
      console.error(e)
      return chainConfig.gasPrice
    }
  }
}
