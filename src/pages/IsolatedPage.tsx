import { useCallback, useMemo } from 'react'
import Card from 'components/common/Card'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import { Cross } from 'components/common/Icons'
import AssetImage from 'components/common/assets/AssetImage'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import { getDefaultChainSettings } from 'constants/defaultSettings'

export default function IsolatedPage() {
  const chainConfig = useChainConfig()
  const stableDenom = chainConfig.stables[0]
  const stableAsset = useAsset(stableDenom)

  const [isCollateralBannerVisible, setIsCollateralBannerVisible] = useLocalStorage(
    LocalStorageKeys.SHOW_ISOLATED_COLLATERAL_BANNER,
    getDefaultChainSettings(chainConfig).showIsolatedCollateralBanner,
  )

  const handleCloseBanner = useCallback(() => {
    setIsCollateralBannerVisible(false)
  }, [setIsCollateralBannerVisible])

  const usdcCollateralBanner = useMemo(() => {
    if (!isCollateralBannerVisible) return null

    return (
      <div className='w-full mb-4'>
        <Card className='p-0 overflow-hidden bg-gradient-to-r from-purple/10 to-white/5'>
          <div className='relative'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple to-purple/50' />

            <div className='absolute top-2 right-2'>
              <Button
                variant='transparent'
                color='quaternary'
                onClick={handleCloseBanner}
                leftIcon={<Cross />}
                className='!p-1.5'
                iconClassName='w-3 h-3 text-white/70'
                aria-label='Close banner'
              />
            </div>

            <div className='p-4 pt-5'>
              <div className='flex items-start'>
                {stableAsset && (
                  <div className='mr-4 mt-1'>
                    <div className='p-2 bg-white/10 rounded-full'>
                      <AssetImage asset={stableAsset} className='w-8 h-8' />
                    </div>
                  </div>
                )}
                <div className='flex-1'>
                  <div className='flex items-center mb-2'>
                    <Text size='lg' className='font-semibold mr-2'>
                      Isolated Margin with {stableAsset?.symbol || 'USDC'} Only
                    </Text>
                  </div>
                  <Text size='sm' className='text-white/70 mb-3'>
                    Isolated accounts only accept {stableAsset?.symbol || 'USDC'} as collateral,
                    allowing you to manage risk by separating your positions from your main account.
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }, [stableAsset, isCollateralBannerVisible, handleCloseBanner])

  return (
    <div className='flex flex-wrap w-full gap-4 md:grid md:grid-cols-chart'>
      <div className='w-full'>
        {usdcCollateralBanner}
        <Card title='Trading Chart'>
          <PerpsChart />,
        </Card>
      </div>
      <div className='w-full row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
