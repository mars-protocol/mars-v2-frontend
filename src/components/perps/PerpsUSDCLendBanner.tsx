import { useState } from 'react'
import Card from 'components/common/Card'
import Accordion from 'components/common/Accordion'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import AssetImage from 'components/common/assets/AssetImage'
import AssetRate from 'components/common/assets/AssetRate'
import ActionButton from 'components/common/Button/ActionButton'
import { ArrowDownLine, ArrowUpLine } from 'components/common/Icons'
import useLendAndReclaimModal from 'hooks/common/useLendAndReclaimModal'
import AmountAndValue from 'components/common/AmountAndValue'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import useChainConfig from 'hooks/chain/useChainConfig'

function USDCLendingRow({ data, isLent }: { data: LendingMarketTableData; isLent: boolean }) {
  const { openLend, openReclaim } = useLendAndReclaimModal()

  return (
    <div className='flex items-center justify-between p-4 bg-white/5'>
      <div className='flex items-center gap-3'>
        <AssetImage asset={data.asset} className='w-8 h-8' />
        <div>
          <div className='flex items-center gap-2'>
            <Text size='lg' className='font-medium'>
              {data.asset.symbol}
            </Text>
            {isLent && (
              <div className='text-sm'>
                <AmountAndValue asset={data.asset} amount={data.accountLentAmount || BN_ZERO} />
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Text size='sm' className='text-white/60'>
              APY
            </Text>
            <AssetRate
              rate={data.apy.deposit}
              isEnabled={data.borrowEnabled}
              type='apy'
              orientation='ltr'
              hasCampaignApy={
                data.asset.campaigns.find((c: AssetCampaign) => c.type === 'apy') !== undefined
              }
            />
          </div>
        </div>
      </div>
      <ActionButton
        leftIcon={isLent ? <ArrowDownLine /> : <ArrowUpLine />}
        text={isLent ? 'Unlend' : 'Lend'}
        color='tertiary'
        onClick={() => (isLent ? openReclaim(data) : openLend(data))}
      />
    </div>
  )
}

const lendingData = (stableAsset: Asset, stableDenom: string) => ({
  asset: stableAsset,
  borrowEnabled: true,
  depositEnabled: true,
  debt: BN_ZERO,
  deposits: BN_ZERO,
  liquidity: BN_ZERO,
  cap: {
    max: BN_ZERO,
    used: BN_ZERO,
    denom: stableDenom,
  },
  apy: {
    borrow: 0,
    deposit: 0,
  },
  ltv: {
    max: 0,
    liq: 0,
  },
  borrow_index: '0',
  borrow_rate: '0',
  collateral_total_scaled: '0',
  debt_total_scaled: '0',
  denom: stableDenom,
  indexes_last_updated: 0,
  interest_rate_model: {
    optimal_utilization_rate: '0',
    base: '0',
    slope_1: '0',
    slope_2: '0',
  },
  liquidity_index: '0',
  liquidity_rate: '0',
  reserve_factor: '0',
})

function USDCLendingFallback({ stableDenom }: { stableDenom: string }) {
  const stableAsset = useAsset(stableDenom)
  if (!stableAsset) return null

  return <USDCLendingRow data={lendingData(stableAsset, stableDenom)} isLent={false} />
}

export default function PerpsUSDCLendBanner() {
  const [isLendingOpen, setIsLendingOpen] = useState(true)
  const chainConfig = useChainConfig()
  const { accountLentAssets, availableAssets } = useLendingMarketAssetsTableData()

  const usdcLendingData = {
    accountLentAssets: accountLentAssets.filter(
      (asset) => asset.asset.denom === chainConfig.stables[0],
    ),
    availableAssets: availableAssets.filter(
      (asset) => asset.asset.denom === chainConfig.stables[0],
    ),
  }

  return (
    <div className='w-full mb-4'>
      <Card className='p-0 overflow-hidden bg-gradient-to-r from-purple/10 to-white/5'>
        <div className='relative'>
          <div className='absolute top-0 left-0 w-full h-1'></div>
          <Accordion
            allowMultipleOpen
            items={[
              {
                title: 'Lend',
                renderContent: () =>
                  usdcLendingData.accountLentAssets.length > 0 ? (
                    <USDCLendingRow data={usdcLendingData.accountLentAssets[0]} isLent />
                  ) : usdcLendingData.availableAssets.length > 0 ? (
                    <USDCLendingRow data={usdcLendingData.availableAssets[0]} isLent={false} />
                  ) : (
                    <USDCLendingFallback stableDenom={chainConfig.stables[0]} />
                  ),
                renderSubTitle: () => null,
                isOpen: isLendingOpen,
                toggleOpen: () => setIsLendingOpen(!isLendingOpen),
              },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}
