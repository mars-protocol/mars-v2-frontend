import AssetImage from 'components/AssetImage'
import DisplayCurrency from 'components/DisplayCurrency'
import { StarFilled, StarOutlined } from 'components/Icons'
import Text from 'components/Text'
import { FAVORITE_ASSETS_KEY } from 'constants/localStore'
import { BN_ONE } from 'constants/math'
import useLocalStorage from 'hooks/useLocalStorage'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  asset: Asset
  onSelectAsset: (asset: Asset) => void
  depositCap?: DepositCap
}

export default function AssetItem(props: Props) {
  const asset = props.asset
  const [favoriteAssetsDenoms, setFavoriteAssetsDenoms] = useLocalStorage<string[]>(
    FAVORITE_ASSETS_KEY,
    [],
  )

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
        className='flex w-full items-center justify-between gap-2 p-4'
      >
        <div className='flex items-center gap-2'>
          <div onClick={handleToggleFavorite}>
            {asset.isFavorite ? <StarFilled width={16} /> : <StarOutlined width={16} />}
          </div>
          <AssetImage asset={asset} size={24} />
          <div className='flex-col'>
            <div className='flex gap-1'>
              <Text size='sm' className='text-left'>
                {asset.name}
              </Text>
              <div className='rounded-sm bg-white/20 px-[6px] py-[2px]'>
                <Text size='xs'>{asset.symbol}</Text>
              </div>
            </div>
            {props.depositCap && (
              <div className='flex gap-1'>
                <span className='text-left text-white/60 text-xs'>Cap Left: </span>
                <DisplayCurrency
                  className='text-left text-white/60 text-xs'
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
