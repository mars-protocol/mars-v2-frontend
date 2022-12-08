import { Coin } from '@cosmjs/stargate'
import BigNumber from 'bignumber.js'
import FormattedNumber from 'components/FormattedNumber'
import Text from 'components/Text'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'

interface Props {
  labels: string[]
  data?: Coin[]
  debtData?: Coin[]
}

const PositionList = ({ labels, data, debtData }: Props) => {
  const { data: tokenPrices } = useTokenPrices()
  const { data: marketsData } = useMarkets()
  const getTokenTotalUSDValue = (amount: string, denom: string) => {
    if (!tokenPrices) return 0

    return (
      BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .toNumber() * tokenPrices[denom]
    )
  }

  return (
    <div className='flex w-full flex-wrap'>
      <Text uppercase className='w-full bg-black/20 px-4 py-2 text-white/40'>
        Balances
      </Text>
      <div className='flex w-full flex-wrap'>
        <div className='mb-2 flex w-full border-b border-white/20 bg-black/20 px-4 py-2'>
          {labels.map((label, index) => (
            <Text key={index} size='xs' uppercase className='flex-1 text-white'>
              {label}
            </Text>
          ))}
        </div>
        {data &&
          data.map((coin) => (
            <div key={coin.denom} className='flex w-full px-4 py-2'>
              <Text size='xs' className='flex-1 border-l-4 border-profit pl-2 text-white/60'>
                {getTokenSymbol(coin.denom)}
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                <FormattedNumber
                  amount={getTokenTotalUSDValue(coin.amount, coin.denom)}
                  animate
                  prefix='$'
                />
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                <FormattedNumber
                  amount={BigNumber(coin.amount)
                    .div(10 ** getTokenDecimals(coin.denom))
                    .toNumber()}
                  animate
                  minDecimals={0}
                  maxDecimals={4}
                />
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                -
              </Text>
            </div>
          ))}
        {debtData &&
          debtData.map((coin) => (
            <div key={coin.denom} className='flex w-full px-4 py-2'>
              <Text size='xs' className='flex-1 border-l-4 border-loss pl-2 text-white/60'>
                {getTokenSymbol(coin.denom)}
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                <FormattedNumber
                  amount={getTokenTotalUSDValue(coin.amount, coin.denom)}
                  prefix='-$'
                  animate
                />
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                <FormattedNumber
                  amount={BigNumber(coin.amount)
                    .div(10 ** getTokenDecimals(coin.denom))
                    .toNumber()}
                  minDecimals={0}
                  maxDecimals={4}
                  animate
                />
              </Text>
              <Text size='xs' className='flex-1 text-white/60'>
                <FormattedNumber
                  amount={Number(marketsData?.[coin.denom].borrow_rate) * 100}
                  minDecimals={0}
                  maxDecimals={2}
                  prefix='-'
                  suffix='%'
                  animate
                />
              </Text>
            </div>
          ))}
      </div>
    </div>
  )
}

export default PositionList
