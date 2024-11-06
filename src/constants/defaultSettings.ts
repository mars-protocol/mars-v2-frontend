import { BN_ZERO_ONE } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import { BNCoin } from 'types/classes/BNCoin'
import { RewardsCenterType } from 'types/enums'
import { ResolutionString } from 'utils/charting_library'

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
    perpsKeeperFee: BNCoin.fromDenomAndBigNumber('usd', BN_ZERO_ONE).toCoin(),
    tvChartStore: JSON.stringify({}),
  }
}
