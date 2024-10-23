import { TextLink } from 'components/common/TextLink'
import { DocURL } from 'types/enums'

import useAssets from 'hooks/assets/useAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useStore from 'store'
import packageInfo from '../../../package.json'

export default function Footer() {
  // Set the global State to have assets and perpsBaseDenom in it
  const { data: assets, isLoading: isLoadingAssets } = useAssets()
  const { data: vault, isLoading: isLoadingVault } = usePerpsVault()
  const storeAssets = useStore((s) => s.assets)
  const perpsBaseDenom = useStore((s) => s.perpsBaseDenom)

  if (storeAssets.length === 0 && !isLoadingAssets) useStore.setState({ assets })
  if (!perpsBaseDenom && !isLoadingVault && vault)
    useStore.setState({ perpsBaseDenom: vault.denom })

  const version = `v${packageInfo.version}`
  return (
    <footer className='flex items-center justify-center w-full h-6 -mt-6'>
      <div className='w-full p-2 pt-0 text-right md:p-4'>
        <TextLink
          className='text-xs text-white opacity-50 hover:text-white hover:opacity-80'
          href={`${DocURL.FEATURE_URL}${version}`}
          target='_blank'
          title={`Mars Protocol ${version} change log`}
        >
          {version}
        </TextLink>
      </div>
    </footer>
  )
}
