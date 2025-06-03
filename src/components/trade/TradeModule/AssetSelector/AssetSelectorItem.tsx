import { useMemo } from 'react'

import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { StarFilled, StarOutlined } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import AssetSymbol from 'components/common/assets/AssetSymbol'
import { BN_ONE, BN_ZERO, MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useFavoriteAssets from 'hooks/localStorage/useFavoriteAssets'
import { BNCoin } from 'types/classes/BNCoin'
import { getPerpsPositionInfo } from 'utils/accounts'
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
  type?: 'buy' | 'sell' | 'perps'
}
export default function AssetSelectorItem(props: Props) {
  const { asset, sellAsset, balances, onSelect, depositCap, isActive, type } = props
  const account = useCurrentAccount()

  const amount = demagnify(props.balances.find(byDenom(asset.denom))?.amount ?? BN_ZERO, asset)

  const perpsInfo = useMemo(() => {
    if (type === 'perps' && account) {
      return getPerpsPositionInfo(account, asset.denom)
    }
    return { position: null, hasPosition: false }
  }, [type, account, asset.denom])

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

  const shouldShowBalance = balances.length > 0 && (type !== 'perps' || perpsInfo.hasPosition)
  const balanceLabel = type === 'perps' ? 'Size ' : 'Balance: '

  const positionValue = useMemo(() => {
    if (type === 'perps' && perpsInfo.position && asset.price) {
      return amount * asset.price.amount.toNumber()
    }
    return 0
  }, [type, perpsInfo.position, amount, asset.price])

  return (
    <li
      className={classNames(
        'relative w-full border-b border-white/10 hover:bg-black/10 z-1',
        isActive && 'bg-white/20',
      )}
    >
      <button
        onClick={() => onSelect(sellAsset ? { buy: asset, sell: sellAsset } : asset)}
        className='flex items-center justify-between w-full gap-2 px-4 min-h-14'
      >
        <div className='flex items-center gap-2'>
          <div onClick={handleToggleFavorite} className='w-4'>
            {isFavorite ? <StarFilled /> : <StarOutlined />}
          </div>
          <AssetImage asset={asset} className='w-6 h-6' />
          <div className='flex-col'>
            <div className='flex gap-1 flex-nowrap max-w-[185px] items-center'>
              {sellAsset ? (
                <Text size='sm' className='h-5 leading-5 text-left text-white/60'>
                  <span className='text-white'>{asset.symbol}</span>/{sellAsset.symbol}
                </Text>
              ) : (
                <>
                  <Text size='sm' className='h-5 leading-5 text-left truncate '>
                    {asset.name}
                    {asset.isDeprecated && <span className='text-info ml-1'>(disabled)</span>}
                  </Text>
                  <AssetSymbol symbol={asset.symbol} />
                </>
              )}
            </div>
            {shouldShowBalance && (
              <div className='flex gap-1 items-center mt-1'>
                {type === 'perps' ? (
                  <Text size='xs' className='text-white/60'>
                    Size:{' '}
                    {amount >= 1
                      ? formatAmountToPrecision(amount, MAX_AMOUNT_DECIMALS)
                      : formatAmountToPrecision(lowAmount, MAX_AMOUNT_DECIMALS)}
                  </Text>
                ) : (
                  <>
                    <span className='text-xs text-left text-white/80'>{balanceLabel}</span>
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
                  </>
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
        <div className='flex flex-col items-end'>
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
          {type === 'perps' && perpsInfo.hasPosition && positionValue > 0 && (
            <Text size='xs' className='text-white/60 mt-1'>
              Value: ${positionValue.toFixed(2)}
            </Text>
          )}
        </div>
      </button>
    </li>
  )
}
