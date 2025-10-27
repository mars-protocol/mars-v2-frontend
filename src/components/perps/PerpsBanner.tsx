import Banner from 'components/common/Banner'
import { Deposit } from 'components/earn/farm/common/Table/Columns/Deposit'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { byDenom } from 'utils/array'
import { formatValue } from 'utils/formatters'

export default function PerpsBanner() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const chainConfig = useChainConfig()
  const asset = whitelistedAssets.find(byDenom(vault?.denom ?? ''))
  const [showPerpsVaultBanner, setShowPerpsVaultBanner] = useLocalStorage(
    LocalStorageKeys.SHOW_PERPS_VAULT_BANNER,
    getDefaultChainSettings(chainConfig).showPerpsVaultBanner,
  )

  if (!showPerpsVaultBanner) return null
  return (
    <Banner
      asset={asset}
      onClose={() => setShowPerpsVaultBanner(false)}
      title={
        <>
          Counterparty vault APY:{' '}
          <span className='text-martian-red'>
            {formatValue(vault?.apy ?? 0, {
              suffix: '%',
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
