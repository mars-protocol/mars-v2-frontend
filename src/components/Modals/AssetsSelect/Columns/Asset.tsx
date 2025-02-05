import { Row } from '@tanstack/react-table'
import Checkbox from 'components/common/Checkbox'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import AssetImage from 'components/common/assets/AssetImage'
import AssetImageEvm from 'components/common/assets/AssetImageEvm'
import { getChainLogoByName } from 'utils/chainLogos'

export const ASSET_META = { id: 'name', header: 'Asset', accessorKey: 'asset.symbol' }

interface Props {
  row: Row<AssetTableRow>
}

function isBorrowAsset(object?: any): object is BorrowAsset {
  if (!object) return false
  return 'borrowRate' in object
}

export default function Asset(props: Props) {
  const { row } = props
  const asset = row.original.asset
  const market = row.original.market
  const isBorrow = isBorrowAsset(asset)
  const showRate = !isBorrow && market?.borrowEnabled
  const apy = isBorrow ? market?.apy.borrow : market?.apy.deposit

  return (
    <div className='flex items-center'>
      <Checkbox
        name={`asset-${asset.denom.toLowerCase()}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        noMouseEvents
      />
      {asset.chainName ? (
        <AssetImageEvm
          asset={asset}
          size={24}
          className='w-6 h-6 ml-4'
          evmChainLogo={getChainLogoByName(asset.chainName)}
        />
      ) : (
        <AssetImage asset={asset} className='w-6 h-6 ml-4' />
      )}
      <div className='ml-2 flex flex-col'>
        <div className='flex items-center gap-2'>
          <Text size='sm' className='text-white font-medium'>
            {asset.symbol}
          </Text>
          {asset.chainName && (
            <div className='px-1 h-4 flex items-center rounded bg-white/5'>
              <Text size='xs' className='text-white/60'>
                {asset.chainName}
              </Text>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {showRate && market ? (
            <Text size='xs' className='text-white/60'>
              {(apy ?? 0).toFixed(1)}% APY
            </Text>
          ) : (
            <Tooltip
              type='info'
              content={
                <Text size='2xs' className='w-full'>
                  {asset.denom}
                </Text>
              }
            >
              <Text size='xs' className='text-white/60'>
                {asset.name}
              </Text>
            </Tooltip>
          )}
          {asset.campaigns.map((campaign, index) => (
            <AssetCampaignCopy size='xs' asset={asset} key={index} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  )
}
