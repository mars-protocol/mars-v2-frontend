import { ORACLE_DENOM } from 'constants/oracle'
import { RewardsCenterType } from 'types/enums'
import { ResolutionString } from 'utils/charting_library'

export const defaultKeeperFeeDenom =
  'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81'
export const defaultKeeperFeeAmount = '200000'

export const getDefaultChainSettings = (chainConfig: ChainConfig) => {
  return {
    accountSummaryTabsExpanded: [true, true, true, true],
    accountSummaryInModalTabsExpanded: [true, true, true, false],
    reduceMotion: false,
    enableAutoLendGlobal: true,
    tradingPairSimple: chainConfig.defaultTradingPair,
    tradingPairAdvanced: chainConfig.defaultTradingPair,
    displayCurrency: ORACLE_DENOM,
    slippage: 0.01,
    tutorial: true,
    migrationBanner: true,
    perpsAsset: '',
    updateOracle: true,
    chartInterval: '60' as ResolutionString,
    theme: 'default',
    rewardsCenterType: RewardsCenterType.Token,
    showSummary: true,
    tvChartStore: JSON.stringify({}),
    showPerpsVaultBanner: true,
    fundingRateInterval: '1H',
    keeperFee: JSON.stringify({
      denom: defaultKeeperFeeDenom,
      amount: defaultKeeperFeeAmount,
    }),
  }
}
