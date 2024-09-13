import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import DoubleLogo from 'components/common/DoubleLogo'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

export const NAME_META = { id: 'name', header: 'Strategy', meta: { className: 'min-w-50' } }
interface Props {
  account?: HlsAccountWithStrategy
  strategy: HlsStrategy
}

export default function Name(props: Props) {
  const { account, strategy } = props

  const depositAsset = useAsset(strategy.denoms.deposit)
  const borrowAsset = useAsset(strategy.denoms.borrow)
  const depositedAmount = useMemo(
    () =>
      !account
        ? BN_ZERO
        : (account.deposits.find(byDenom(strategy.denoms.deposit))?.amount ?? BN_ZERO),
    [account, strategy.denoms.deposit],
  )
  return (
    <div className='flex'>
      <DoubleLogo primaryDenom={strategy.denoms.deposit} secondaryDenom={strategy.denoms.borrow} />
      {depositAsset && borrowAsset ? (
        <div className='flex flex-wrap'>
          <TitleAndSubCell
            containerClassName='w-full'
            className='ml-2 mr-2 text-left'
            title={`${depositAsset.symbol} - ${borrowAsset.symbol}`}
            sub='Via Mars Protocol'
          />
          <div>
            {depositAsset.campaigns
              .filter((campaign) => campaign.type !== 'apy')
              .map((campaign, index) => (
                <AssetCampaignCopy
                  className='ml-2 mr-2'
                  campaign={campaign}
                  asset={depositAsset}
                  size='xs'
                  noDot
                  amount={depositedAmount}
                  key={index}
                  account={account}
                />
              ))}
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  )
}
