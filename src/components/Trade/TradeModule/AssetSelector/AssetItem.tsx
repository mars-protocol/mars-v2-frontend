import AssetImage from 'components/AssetImage'
import DisplayCurrency from 'components/DisplayCurrency'
import { StarFilled, StarOutlined } from 'components/Icons'
import Text from 'components/Text'
import { FAVORITE_ASSETS } from 'constants/localStore'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  asset: Asset
  onSelectAsset: (asset: Asset) => void
}

export default function AssetItem(props: Props) {
  const asset = props.asset

  function handleToggleFavorite(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.stopPropagation()
    const favoriteAssets: string[] = JSON.parse(localStorage.getItem(FAVORITE_ASSETS) || '[]')
    if (favoriteAssets) {
      if (favoriteAssets.includes(asset.denom)) {
        localStorage.setItem(
          FAVORITE_ASSETS,
          JSON.stringify(favoriteAssets.filter((item: string) => item !== asset.denom)),
        )
      } else {
        localStorage.setItem(FAVORITE_ASSETS, JSON.stringify([...favoriteAssets, asset.denom]))
      }
      window.dispatchEvent(new Event('storage'))
    }
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
          <Text size='sm' className='text-left'>
            {asset.name}
          </Text>
          <div className='rounded-sm bg-white/20 px-[6px] py-[2px]'>
            <Text size='xs'>{asset.symbol}</Text>
          </div>
        </div>
        <DisplayCurrency
          className='text-sm'
          coin={
            new BNCoin({ denom: asset.denom, amount: BN(1).shiftedBy(asset.decimals).toString() })
          }
        />
      </button>
    </li>
  )
}
