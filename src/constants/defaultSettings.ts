import { ORACLE_DENOM } from 'constants/oracle'
import { RewardsCenterType } from 'types/enums'
import { ResolutionString } from 'utils/charting_library'

export const getDefaultKeeperFee = (chainConfig: ChainConfig) => {
  return {
    denom: chainConfig.stables[0],
    amount: '200000',
  }
}

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
    keeperFee: JSON.stringify(getDefaultKeeperFee(chainConfig)),
  }
}
