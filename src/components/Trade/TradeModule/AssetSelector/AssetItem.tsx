import AssetImage from 'components/Asset/AssetImage'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { StarFilled, StarOutlined } from 'components/Icons'
import Text from 'components/Text'
import { FAVORITE_ASSETS_KEY } from 'constants/localStore'
import { BN_ONE, BN_ZERO, MAX_AMOUNT_DECIMALS, MIN_AMOUNT } from 'constants/math'
import useLocalStorage from 'hooks/useLocalStorage'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { demagnify, formatAmountToPrecision } from 'utils/formatters'

interface Props {
  asset: Asset
  onSelectAsset: (asset: Asset) => void
  depositCap?: DepositCap
  balances: BNCoin[]
}

export default function AssetItem(props: Props) {
  const asset = props.asset
  const [favoriteAssetsDenoms, setFavoriteAssetsDenoms] = useLocalStorage<string[]>(
    FAVORITE_ASSETS_KEY,
    [],
  )
  const amount = demagnify(props.balances.find(byDenom(asset.denom))?.amount ?? BN_ZERO, asset)
  const formattedAmount = formatAmountToPrecision(amount, MAX_AMOUNT_DECIMALS)

  function handleToggleFavorite(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation()

    if (!favoriteAssetsDenoms.includes(asset.denom)) {
      setFavoriteAssetsDenoms([...favoriteAssetsDenoms, asset.denom])
      return
    }
    setFavoriteAssetsDenoms(favoriteAssetsDenoms.filter((item: string) => item !== asset.denom))
  }

  return (
    <li className='border-b border-white/10 hover:bg-black/10'>
      <button
        onClick={() => props.onSelectAsset(asset)}
        className='flex items-center justify-between w-full gap-2 p-4'
      >
        <div className='flex items-center gap-2'>
          <div onClick={handleToggleFavorite}>
            {asset.isFavorite ? <StarFilled width={16} /> : <StarOutlined width={16} />}
          </div>
          <AssetImage asset={asset} size={24} />
          <div className='flex-col'>
            <div className='flex gap-1 flex-nowrap max-w-[185px]'>
              <Text size='sm' className='h-5 leading-5 text-left truncate '>
                {asset.name}
              </Text>
              <div className='rounded-sm bg-white/20 px-[6px] py-[2px] h-5 leading-5 '>
                <Text size='xs'>{asset.symbol}</Text>
              </div>
            </div>
            {props.balances.length > 0 && (
              <div className='flex gap-1'>
                <span className='text-xs text-left text-white/60'>Balance: </span>
                {amount >= 1 ? (
                  <FormattedNumber
                    className='text-xs text-left text-white/60'
                    amount={amount}
                    options={{ abbreviated: true, maxDecimals: MAX_AMOUNT_DECIMALS }}
                    animate
                  />
                ) : (
                  <FormattedNumber
                    className='text-xs text-left text-white/60'
                    smallerThanThreshold={formattedAmount !== 0 && formattedAmount < MIN_AMOUNT}
                    amount={
                      formattedAmount === 0
                        ? 0
                        : formattedAmount < MIN_AMOUNT
                        ? MIN_AMOUNT
                        : formattedAmount
                    }
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
            new BNCoin({ denom: asset.denom, amount: BN_ONE.shiftedBy(asset.decimals).toString() })
          }
        />
      </button>
    </li>
  )
}
