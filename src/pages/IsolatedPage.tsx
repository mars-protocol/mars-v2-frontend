import { useCallback, useMemo, useState } from 'react'
import Card from 'components/common/Card'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import { Callout, CalloutType } from 'components/common/Callout'
import IsolatedAccountMintAndFund from 'components/account/IsolatedAccountMintAndFund'
import useStore from 'store'
import { Cross, InfoCircle, PlusCircled } from 'components/common/Icons'
import useHasIsolatedAccounts from 'hooks/accounts/useHasIsolatedAccounts'
import { CircularProgress } from 'components/common/CircularProgress'
import AssetImage from 'components/common/assets/AssetImage'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

export default function IsolatedPage() {
  const { hasIsolatedAccounts, isLoading } = useHasIsolatedAccounts()
  const chainConfig = useChainConfig()
  const stableDenom = chainConfig.stables[0]
  const stableAsset = useAsset(stableDenom)

  const [isCollateralBannerVisible, setIsCollateralBannerVisible] = useLocalStorage(
    'isolated-collateral-banner-visible',
    true,
  )

  const handleCreateIsolatedAccount = useCallback(() => {
    useStore.setState({
      focusComponent: {
        component: <IsolatedAccountMintAndFund />,
      },
    })
  }, [])

  const handleCloseBanner = useCallback(() => {
    setIsCollateralBannerVisible(false)
  }, [setIsCollateralBannerVisible])

  const accountCreationBanner = useMemo(() => {
    if (isLoading) {
      return (
        <div className='w-full mb-4'>
          <Card className='p-4 bg-white/5'>
            <div className='flex items-center justify-center p-2'>
              <CircularProgress size={24} className='mr-2' />
              <Text size='sm'>Checking account status...</Text>
            </div>
          </Card>
        </div>
      )
    }

    if (!hasIsolatedAccounts) {
      return (
        <div className='w-full mb-4'>
          <Card className='p-4 bg-white/5'>
            <div className='flex flex-col md:flex-row md:items-center justify-between'>
              <div>
                <Text size='lg' className='font-semibold mb-2'>
                  Isolated Margin Trading
                </Text>
                <Text size='sm' className='text-white/70'>
                  In order to trade on isolated margin, you should first create an isolated margin
                  account.
                </Text>
              </div>
              <Button
                text='Create Isolated Account'
                color='primary'
                size='md'
                className='mt-3 md:mt-0'
                leftIcon={<PlusCircled />}
                onClick={handleCreateIsolatedAccount}
              />
            </div>
          </Card>
        </div>
      )
    }

    return null
  }, [isLoading, hasIsolatedAccounts, handleCreateIsolatedAccount])

  const usdcCollateralBanner = useMemo(() => {
    if (!isCollateralBannerVisible) return null

    return (
      <div className='w-full mb-4'>
        <Card className='p-0 overflow-hidden bg-gradient-to-r from-purple/10 to-white/5'>
          <div className='relative'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple to-purple/50'></div>

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
                  {/* <Callout type={CalloutType.INFO} className='mt-2'>
                    <div className='flex items-center'>
                      <span>
                        Trading in an isolated account helps limit your risk exposure to only the
                        funds deposited in this account.
                      </span>
                    </div>
                  </Callout> */}
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
        {accountCreationBanner}

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
