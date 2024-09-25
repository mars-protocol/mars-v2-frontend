import Banner from 'components/common/Banner'
import { Deposit } from 'components/earn/farm/common/Table/Columns/Deposit'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { byDenom } from 'utils/array'

export default function PerpsBanner() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets.find(byDenom(vault?.denom ?? ''))

  return (
    <Banner
      asset={asset}
      title={
        <>
          Counterparty vault: earn up to <span className='text-purple'>{vault?.apy}% APY.</span>
        </>
      }
      description={`Earn perps trading fees by depositing ${asset?.symbol} into the counterparty vault, with deposits subject to a ${vault?.lockup.duration}-${vault?.lockup.timeframe} lockup.`}
      button={
        <Deposit vault={vault as PerpsVault} isLoading={false} isPerps buttonColor='primary' />
      }
    />
  )
}
