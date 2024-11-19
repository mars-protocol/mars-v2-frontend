import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Text from 'components/common/Text'
import AssetSummary from 'components/Modals/Hls/Deposit/Summary/AssetSummary'
import MultiAssetSummary from 'components/Modals/Hls/Deposit/Summary/MultiAssetSummary'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAssets from 'hooks/assets/useAssets'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSlippage from 'hooks/settings/useSlippage'
import { useCallback, useMemo, useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { removeEmptyBNCoins } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getAstroLpCoinsFromShares } from 'utils/astroLps'
import { getFarmActions } from 'utils/farm'
import { getCoinValue } from 'utils/formatters'

interface Props {
  borrowings: BNCoin[]
  deposits: BNCoin[]
  account: Account
  astroLp: AstroLp
  primaryAsset: Asset
  secondaryAsset: Asset
  totalValue: BigNumber
  depositCapReachedCoins: BNCoin[]
  isCreate?: boolean
}

export default function HlsFarmingSummary(props: Props) {
  const { borrowings, deposits, account, astroLp } = props
  const { data: assets } = useAssets()
  const chainConfig = useChainConfig()
  const [slippage] = useSlippage()
  const depositIntoFarm = useStore((s) => s.depositIntoFarm)
  const updatedAccount = useStore((s) => s.updatedAccount)
  const [isCalculating, setIsCaluclating] = useState(false)
  const stakedAstroLps = useMemo(
    () => (updatedAccount?.stakedAstroLps ?? []) as BNCoin[],
    [updatedAccount],
  )
  const astroLpCoins = useMemo(
    () =>
      stakedAstroLps.length ? getAstroLpCoinsFromShares(stakedAstroLps[0], astroLp, assets) : [],
    [stakedAstroLps, astroLp, assets],
  )

  const handleDeposit = useCallback(async () => {
    setIsCaluclating(true)
    const actions = await getFarmActions(
      astroLp,
      deposits,
      [],
      props.borrowings,
      assets,
      slippage,
      chainConfig,
      false,
      true,
      true,
    )

    useStore.setState({ farmModal: null })
    setIsCaluclating(false)
    await depositIntoFarm({
      accountId: account.id,
      actions,
      deposits: removeEmptyBNCoins(deposits),
      borrowings: borrowings,
      kind: 'high_levered_strategy' as AccountKind,
    })
  }, [
    astroLp,
    deposits,
    props.borrowings,
    assets,
    slippage,
    chainConfig,
    depositIntoFarm,
    account.id,
    borrowings,
  ])

  const newTotalValue = useMemo(() => {
    let totalLpValue = BN_ZERO
    astroLpCoins.forEach((coin) => {
      const coinValue = getCoinValue(coin, assets)
      totalLpValue = totalLpValue.plus(coinValue)
    })
    return totalLpValue
  }, [astroLpCoins, assets])

  const totalValueString = props.isCreate
    ? `${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`
    : `New ${props.primaryAsset.symbol}-${props.secondaryAsset.symbol} Position Value`

  return (
    <div id='item-4' className='flex flex-col gap-4 p-4'>
      <DepositsSummary deposits={deposits} />
      {borrowings.map((borrowing, index) => {
        const asset = assets.find(byDenom(borrowing.denom))
        if (!asset) return null
        return (
          <AssetSummary
            asset={asset}
            amount={borrowing.amount}
            borrowAsset={asset}
            isBorrow
            isFarm
            key={index}
          />
        )
      })}

      <MultiAssetSummary coins={astroLpCoins} isResult />
      <div className='flex items-center justify-between'>
        <Text size='sm' className='text-white/50'>
          {totalValueString}
        </Text>
        <DisplayCurrency
          coin={new BNCoin({ denom: ORACLE_DENOM, amount: newTotalValue.toString() })}
          options={{ abbreviated: false, minDecimals: 2, maxDecimals: 2 }}
        />
      </div>
      <Button
        onClick={handleDeposit}
        color='primary'
        text='Deposit'
        showProgressIndicator={isCalculating}
        disabled={
          deposits.length === 0 &&
          borrowings.length === 0 &&
          props.depositCapReachedCoins.length === 0
        }
      />
    </div>
  )
}

function DepositsSummary({ deposits }: { deposits: BNCoin[] }) {
  const assets = useDepositEnabledAssets()

  if (deposits.length === 1) {
    const asset = assets.find(byDenom(deposits[0].denom))
    if (!asset) return null
    return <AssetSummary asset={asset} amount={deposits[0].amount} borrowAsset={asset} isFarm />
  }

  return <MultiAssetSummary coins={deposits} />
}
