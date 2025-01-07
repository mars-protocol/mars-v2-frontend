import { useMemo } from 'react'

import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { StarFilled, StarOutlined } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import AssetSymbol from 'components/common/assets/AssetSymbol'
import { BN_ONE, BN_ZERO, MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useFavoriteAssets from 'hooks/localStorage/useFavoriteAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, formatAmountToPrecision, getPerpsPriceDecimals } from 'utils/formatters'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  sellAsset?: Asset
  balances: BNCoin[]
  onSelect: (selected: Asset | AssetPair) => void
  isActive: boolean
  depositCap?: DepositCap
}
export default function AssetSelectorItem(props: Props) {
  const { asset, sellAsset, balances, onSelect, depositCap, isActive } = props

  const amount = demagnify(props.balances.find(byDenom(asset.denom))?.amount ?? BN_ZERO, asset)

  const [favoriteAssetsDenoms, setFavoriteAssetsDenoms] = useFavoriteAssets()
  const isFavorite = useMemo(
    () => favoriteAssetsDenoms.includes(asset.denom),
    [favoriteAssetsDenoms, asset.denom],
  )

  function handleToggleFavorite(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation()

    if (!favoriteAssetsDenoms.includes(asset.denom)) {
      setFavoriteAssetsDenoms([...favoriteAssetsDenoms, asset.denom])
      return
    }
    setFavoriteAssetsDenoms(favoriteAssetsDenoms.filter((item: string) => item !== asset.denom))
  }
  const formattedAmount = formatAmountToPrecision(amount, MAX_AMOUNT_DECIMALS)
  const lowAmount = formattedAmount === 0 ? 0 : Math.max(formattedAmount, MIN_AMOUNT)

  const capLeft = useMemo(() => {
    if (!props.depositCap) return 0
    const percent = props.depositCap.used.dividedBy(props.depositCap.max).multipliedBy(100)
    const depositCapLeft = 100 - Math.min(percent.toNumber(), 100)
    return depositCapLeft
  }, [props.depositCap])

  return (
    <li
      className={classNames(
        'relative w-full border-b border-white/10 hover:bg-black/10 z-1',
        isActive && 'bg-white/20',
      )}
    >
      <button
        onClick={() => onSelect(sellAsset ? { buy: asset, sell: sellAsset } : asset)}
        className='flex items-center justify-between w-full gap-2 p-4 min-h-14'
      >
        <div className='flex items-center gap-2'>
          <div onClick={handleToggleFavorite} className='w-4'>
            {isFavorite ? <StarFilled /> : <StarOutlined />}
          </div>
          <AssetImage asset={asset} className='w-6 h-6' />
          <div className='flex-col'>
            <div className='flex gap-1 flex-nowrap max-w-[185px]'>
              {sellAsset ? (
                <Text size='sm' className='h-5 leading-5 text-left text-white/60'>
                  <span className='text-white'>{asset.symbol}</span>/{sellAsset.symbol}
                </Text>
              ) : (
                <>
                  <Text size='sm' className='h-5 leading-5 text-left truncate '>
                    {asset.name}
                  </Text>
                  <AssetSymbol symbol={asset.symbol} />
                </>
              )}
            </div>
            {balances.length > 0 && (
              <div className='flex gap-1'>
                <span className='text-xs text-left text-white/80'>Balance: </span>
                {amount >= 1 ? (
                  <FormattedNumber
                    className='text-xs text-left text-white/80'
                    amount={amount}
                    options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
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
                  />
                )}
              </div>
            )}
            {depositCap && capLeft <= 15 && (
              <div className='flex gap-1'>
                <span className='text-xs text-left text-white/60'>Cap Left: </span>
                <DisplayCurrency
                  className='text-xs text-left text-info/60'
                  coin={BNCoin.fromDenomAndBigNumber(
                    depositCap.denom,
                    BN(Math.max(depositCap.max.minus(depositCap.used).toNumber(), 0)),
                  )}
                  options={{ suffix: ` (${Math.max(capLeft, 0).toFixed(2)}%)` }}
                />
              </div>
            )}
          </div>
        </div>
        <DisplayCurrency
          className='text-sm'
          coin={
            new BNCoin({
              denom: asset.denom,
              amount: BN_ONE.shiftedBy(asset.decimals).toString(),
            })
          }
          options={{
            maxDecimals: asset.price ? getPerpsPriceDecimals(asset.price.amount) : undefined,
          }}
          showDetailedPrice
        />
      </button>
    </li>
  )
}
