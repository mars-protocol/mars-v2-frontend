import Button from 'components/common/Button'
import Intro from 'components/common/Intro'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { PlusSquared } from 'components/common/Icons'
import { DocURL } from 'types/enums'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

export default function PerpsIntro() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets?.find((asset) => asset.denom === vault?.denom)

  if (!asset) return null

  return (
    <Intro
      text={
        <>
          <span className='text-white'>Earn perps trading fees</span> by depositing {asset.symbol}{' '}
          into the counterparty vault, with deposits subject to a {vault?.lockup.duration}-
          {vault?.lockup.timeframe} lockup.
        </>
      }
      bg='perps-vault'
    >
      <Button
        text='Read more about Mars'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.DOCS_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
