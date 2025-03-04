import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import Button from 'components/common/Button'
import Card from 'components/common/Card'
import { Callout, CalloutType } from 'components/common/Callout'
import DepositCapMessage from 'components/common/DepositCapMessage'
import FullOverlayContent from 'components/common/FullOverlayContent'
import { ArrowUpLine, InfoCircle } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import AssetImage from 'components/common/assets/AssetImage'
import WalletSelect from 'components/Wallet/WalletSelect'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useMarkets from 'hooks/markets/useMarkets'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCapLeftWithBuffer } from 'utils/generic'
import { getPage, getRoute } from 'utils/route'
import useHasIsolatedAccounts from 'hooks/accounts/useHasIsolatedAccounts'
import { getIsolatedAccounts } from 'utils/accounts'

export default function IsolatedAccountMintAndFund() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const deposit = useStore((s) => s.deposit)
  const [isProcessing, setIsProcessing] = useToggle(false)
  const [searchParams] = useSearchParams()
  const [isAutoLendEnabled] = useEnableAutoLendGlobal()
  const markets = useMarkets()
  const { hasIsolatedAccounts } = useHasIsolatedAccounts()

  const stableDenom = chainConfig.stables[0]
  const stableAsset = useAsset(stableDenom)
  const { data: walletBalances } = useWalletBalances(address || '')
  const balances = walletBalances.map((coin) => new BNCoin(coin))

  const [fundingAmount, setFundingAmount] = useState<BigNumber>(BN_ZERO)

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [address])

  const depositCapReached = (() => {
    if (!stableAsset) return false
    const marketAsset = markets.find((market) => market.asset.denom === stableDenom)
    if (!marketAsset || !marketAsset.cap) return false

    const capLeft = getCapLeftWithBuffer(marketAsset.cap)
    return fundingAmount.isGreaterThan(capLeft)
  })()

  const accountId = useStore((s) => s.selectedIsolatedAccount)

  const handleCreateAndFund = useCallback(async () => {
    if (!address || !stableAsset || fundingAmount.isLessThanOrEqualTo(0)) return

    setIsProcessing(true)

    try {
      const fundingAsset = BNCoin.fromDenomAndBigNumber(stableDenom, fundingAmount)

      const handleDeposit = async () => {
        try {
          const success = await deposit({
            accountId: accountId ?? undefined,
            coins: [fundingAsset],
            accountKind: 'isolated_margin',
            lend: isAutoLendEnabled,
          })

          if (success) {
            // Fetch isolated accounts to get the new account ID
            const isolatedAccounts = await getIsolatedAccounts(chainConfig, address)
            if (isolatedAccounts.length > 0) {
              navigate(
                getRoute(
                  getPage(pathname, chainConfig),
                  searchParams,
                  address,
                  isolatedAccounts[0].id,
                ),
              )
              useStore.setState({ focusComponent: null })
            }
          }
        } catch (error) {
          console.error('Error depositing:', error)
        }
      }

      await handleDeposit()
    } catch (error) {
      console.error('Error creating and funding account:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [
    address,
    stableAsset,
    fundingAmount,
    isAutoLendEnabled,
    deposit,
    stableDenom,
    navigate,
    pathname,
    chainConfig,
    searchParams,
    setIsProcessing,
  ])

  const updateFundingAmount = useCallback((amount: BigNumber) => {
    setFundingAmount(amount)
  }, [])

  const balance = balances.find(byDenom(stableDenom))?.amount ?? BN_ZERO
  const hasFundingAmount = fundingAmount.isGreaterThan(0)

  return (
    <FullOverlayContent
      title={hasIsolatedAccounts ? 'Fund Isolated Account' : 'Create and Fund Isolated Account'}
      copy={
        hasIsolatedAccounts
          ? 'Fund your isolated account with a stablecoin.'
          : 'Create an isolated account with a stablecoin. This will create a new account and fund it in one step.'
      }
      docs='account'
    >
      <Card className='w-full p-6 bg-white/5'>
        <div className='mb-6'>
          {stableAsset && (
            <div className='flex items-center mb-4'>
              <AssetImage asset={stableAsset} className='w-8 h-8 mr-3' />
              <div>
                <Text size='lg' className='font-medium'>
                  {stableAsset.symbol}
                </Text>
                <Text size='xs' className='text-white/60'>
                  {stableAsset.name}
                </Text>
              </div>
            </div>
          )}

          <div className='flex items-center mb-3'>
            <Text size='sm' className='text-white/60 mr-2'>
              {hasIsolatedAccounts
                ? `Deposit ${stableAsset?.symbol || 'Stablecoin'} to fund your isolated account`
                : `Deposit ${stableAsset?.symbol || 'Stablecoin'} to create your isolated account`}
            </Text>
            <Tooltip
              type='info'
              content={
                <Text size='xs'>
                  Isolated accounts allow you to manage risk by separating your positions.
                </Text>
              }
            >
              <InfoCircle className='w-4 h-4 text-white/40 hover:text-white/60' />
            </Tooltip>
          </div>

          <Callout type={CalloutType.INFO} className='mb-4'>
            {hasIsolatedAccounts
              ? `This will fund your isolated account with ${stableAsset?.symbol || 'Stablecoin'} only.`
              : `This will create a new isolated account funded with ${stableAsset?.symbol || 'Stablecoin'} only.`}
          </Callout>

          {stableAsset && (
            <div className='w-full p-4 border rounded-base border-white/20 bg-white/5'>
              <TokenInputWithSlider
                asset={stableAsset}
                onChange={updateFundingAmount}
                amount={fundingAmount}
                max={balance}
                balances={balances}
                maxText='Max'
                disabled={isProcessing}
                warningMessages={[]}
              />
            </div>
          )}

          <DepositCapMessage
            action='fund'
            coins={
              depositCapReached ? [BNCoin.fromDenomAndBigNumber(stableDenom, fundingAmount)] : []
            }
            className='py-2 pr-4 mt-4'
            showIcon
          />

          <SwitchAutoLend
            className='pt-4 mt-4 border border-transparent border-t-white/10'
            accountId=''
          />
        </div>

        <Button
          className='w-full'
          text={hasIsolatedAccounts ? 'Fund Account' : 'Create and Fund Account'}
          color='tertiary'
          size='lg'
          leftIcon={<ArrowUpLine />}
          showProgressIndicator={isProcessing}
          onClick={handleCreateAndFund}
          disabled={!hasFundingAmount || depositCapReached || isProcessing || !stableAsset}
        />
      </Card>
    </FullOverlayContent>
  )
}
