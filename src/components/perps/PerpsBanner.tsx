import Banner from 'components/common/Banner'
import { Deposit } from 'components/earn/farm/common/Table/Columns/Deposit'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { byDenom } from 'utils/array'
import { formatValue } from 'utils/formatters'

export default function PerpsBanner() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets.find(byDenom(vault?.denom ?? ''))

  return (
    <Banner
      asset={asset}
      title={
        <>
          Counterparty vault: Earn up to{' '}
          <span className='text-purple'>
            {formatValue(vault?.apy ?? 0, {
              suffix: '% APY',
              maxDecimals: 2,
              minDecimals: 0,
              abbreviated: false,
            })}
          </span>
        </>
      }
      description={`Earn perps trading fees by depositing ${asset?.symbol} into the counterparty vault, with deposits subject to a ${vault?.lockup.duration}-${vault?.lockup.timeframe} lockup.`}
      button={
        <Deposit vault={vault as PerpsVault} isLoading={false} isPerps buttonColor='primary' />
      }
    />
  )
}
