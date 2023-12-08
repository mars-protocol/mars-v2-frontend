import AssetImage from 'components/Asset/AssetImage'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { StarFilled, StarOutlined } from 'components/Icons'
import Text from 'components/Text'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { BN_ONE, BN_ZERO, MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useLocalStorage from 'hooks/useLocalStorage'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, formatAmountToPrecision } from 'utils/formatters'

interface Props {
  assetPair: AssetPair
  onSelectAssetPair: (assetPair: AssetPair) => void
  depositCap?: DepositCap
  balances: BNCoin[]
}

export default function PairItem(props: Props) {
  const assetPair = props.assetPair
  const [favoriteAssetsDenoms, setFavoriteAssetsDenoms] = useLocalStorage<string[]>(
    LocalStorageKeys.FAVORITE_ASSETS,
    [],
  )
  const amount = demagnify(
    props.balances.find(byDenom(assetPair.buy.denom))?.amount ?? BN_ZERO,
    assetPair.buy,
  )
  const formattedAmount = formatAmountToPrecision(amount, MAX_AMOUNT_DECIMALS)
  const lowAmount = formattedAmount === 0 ? 0 : Math.max(formattedAmount, MIN_AMOUNT)

  function handleToggleFavorite(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation()

    if (!favoriteAssetsDenoms.includes(assetPair.buy.denom)) {
      setFavoriteAssetsDenoms([...favoriteAssetsDenoms, assetPair.buy.denom])
      return
    }
    setFavoriteAssetsDenoms(
      favoriteAssetsDenoms.filter((item: string) => item !== assetPair.buy.denom),
    )
  }

  return (
    <li className='border-b border-white/10 hover:bg-black/10'>
      <button
        onClick={() => props.onSelectAssetPair(assetPair)}
        className='flex items-center justify-between w-full gap-2 p-4'
      >
        <div className='flex items-center gap-2'>
          <div onClick={handleToggleFavorite}>
            {assetPair.buy.isFavorite ? <StarFilled width={16} /> : <StarOutlined width={16} />}
          </div>
          <AssetImage asset={assetPair.buy} size={24} />
          <div className='flex-col'>
            <div className='flex gap-1 flex-nowrap max-w-[185px]'>
              <Text size='sm' className='h-5 leading-5 text-left text-white/60'>
                <span className='text-white'>{assetPair.buy.symbol}</span>/{assetPair.sell.symbol}
              </Text>
            </div>
            {props.balances.length > 0 && (
              <div className='flex gap-1'>
                <span className='text-xs text-left text-white/80'>Balance: </span>
                {amount >= 1 ? (
                  <FormattedNumber
                    className='text-xs text-left text-white/80'
                    amount={amount}
                    options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
                    animate
                  />
                ) : (
                  <FormattedNumber
                    className='text-xs text-left text-white/80'
                    smallerThanThreshold={formattedAmount !== 0 && formattedAmount < MIN_AMOUNT}
                    amount={lowAmount}
                    options={{
                      maxDecimals: MAX_AMOUNT_DECIMALS,
                      minDecimals: 0,
                    }}
                    animate
                  />
                )}
              </div>
            )}
            {props.depositCap && (
              <div className='flex gap-1'>
                <span className='text-xs text-left text-white/60'>Cap Left: </span>
                <DisplayCurrency
                  className='text-xs text-left text-white/60'
                  coin={BNCoin.fromDenomAndBigNumber(props.depositCap.denom, props.depositCap.max)}
                />
              </div>
            )}
          </div>
        </div>
        <DisplayCurrency
          className='text-sm'
          coin={
            new BNCoin({
              denom: assetPair.buy.denom,
              amount: BN_ONE.shiftedBy(assetPair.buy.decimals).toString(),
            })
          }
        />
      </button>
    </li>
  )
}
