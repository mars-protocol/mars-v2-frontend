import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { DocURL } from 'types/enums'

export default function PerpsIntro() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets?.find((asset) => asset.denom === vault?.denom)

  if (!asset) return null

  return (
    <Intro
      text={
        <>
          <span className='text-white'>
            Provide liquidity to the Counterparty Vault and earn perpetuals trading fees.
          </span>{' '}
          Deposits are subject to a {vault?.lockup.duration}-{vault?.lockup.timeframe} unlocking
          period and carry directional risk: when perps traders lose, the vault gains — but when
          they win, the vault takes the loss.
        </>
      }
      bg='perps-vault'
    >
      <Button
        text='Learn more'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.PERPS_VAULT_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
