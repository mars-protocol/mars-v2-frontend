import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Accordion from 'components/common/Accordion'
import Text from 'components/common/Text'
import FarmBorrowings from 'components/Modals/Farm/FarmBorrowings'
import FarmBorrowingsSubTitle from 'components/Modals/Farm/FarmBorrowingsSubTitle'
import FarmDeposits from 'components/Modals/Farm/FarmDeposits'
import FarmDepositsSubTitle from 'components/Modals/Farm/FarmDepositsSubTitle'
import { BN_ZERO } from 'constants/math'
import useDisplayAsset from 'hooks/assets/useDisplayAsset'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useIsOpenArray from 'hooks/common/useIsOpenArray'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import useSlippage from 'hooks/settings/useSlippage'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAstroLpBaseDepositCoinsAndValue, getAstroLpSharesFromCoinsValue } from 'utils/astroLps'
import { getCoinValue, magnify } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { mergeBNCoinArrays } from 'utils/helpers'
import { getVaultBaseDepositCoinsAndValue } from 'utils/vaults'

interface Props {
  farm: Vault | DepositedVault | AstroLp | DepositedAstroLp
  account: Account
  isAstroLp: boolean
  isDeposited?: boolean
  removedDeposits: BNCoin[]
  addedDebts: BNCoin[]
  removedLends: BNCoin[]
  simulateAstroLpDeposit?: (lp: string, deposits: BNCoin[], borrowings: BNCoin[]) => void
  simulateVaultDeposit?: (address: string, deposits: BNCoin[], borrowings: BNCoin[]) => void
}

export default function FarmModalContent(props: Props) {
  const {
    farm,
    account,
    isAstroLp,
    isDeposited,
    removedDeposits,
    addedDebts,
    removedLends,
    simulateAstroLpDeposit,
    simulateVaultDeposit,
  } = props
  const assets = useWhitelistedAssets()
  const [displayCurrency] = useDisplayCurrency()
  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [isCustomRatio, setIsCustomRatio] = useState(false)
  const [depositCoins, setDepositCoins] = useState<BNCoin[]>([])
  const [borrowCoins, setBorrowCoins] = useState<BNCoin[]>([])
  const displayAsset = useDisplayAsset()
  const [slippage] = useSlippage()

  const { totalValue } = useMemo(
    () =>
      isAstroLp
        ? getAstroLpBaseDepositCoinsAndValue(
            farm as AstroLp,
            removedDeposits,
            addedDebts,
            removedLends,
            assets,
          )
        : getVaultBaseDepositCoinsAndValue(
            farm as Vault,
            removedDeposits,
            addedDebts,
            removedLends,
            slippage,
            assets,
          ),
    [addedDebts, assets, farm, isAstroLp, removedDeposits, removedLends, slippage],
  )

  const primaryAsset = useMemo(
    () => assets.find(byDenom(farm.denoms.primary)),
    [assets, farm.denoms.primary],
  )
  const secondaryAsset = useMemo(
    () => assets.find(byDenom(farm.denoms.secondary)),
    [assets, farm.denoms.secondary],
  )
  const depositCapReachedCoins = useMemo(() => {
    if (!farm.cap) return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, BN_ZERO)]

    const capLeft = getCapLeftWithBuffer(farm.cap)
    const totalShares = getAstroLpSharesFromCoinsValue(farm as AstroLp, totalValue, assets)

    if (isAstroLp && totalShares.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(BNCoin.fromDenomAndBigNumber(farm.cap.denom, capLeft), assets).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }

    if (!isAstroLp && totalValue.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(BNCoin.fromDenomAndBigNumber(farm.cap.denom, capLeft), assets).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }

    return []
  }, [farm, displayAsset, totalValue, assets, isAstroLp])

  const onChangeIsCustomRatio = useCallback(
    (isCustomRatio: boolean) => setIsCustomRatio(isCustomRatio),
    [setIsCustomRatio],
  )

  const deposits = useMemo(
    () => mergeBNCoinArrays(removedDeposits, removedLends),
    [removedDeposits, removedLends],
  )

  const onChangeDeposits = useCallback(
    (coins: BNCoin[]) => {
      setDepositCoins(coins)
      if (isAstroLp && simulateAstroLpDeposit)
        simulateAstroLpDeposit(farm.denoms.lp, coins, borrowCoins)
      if (!isAstroLp && simulateVaultDeposit) simulateVaultDeposit(farm.address, coins, borrowCoins)
    },
    [
      borrowCoins,
      farm.address,
      farm.denoms.lp,
      isAstroLp,
      simulateAstroLpDeposit,
      simulateVaultDeposit,
    ],
  )

  const onChangeBorrowings = useCallback(
    (coins: BNCoin[]) => {
      setBorrowCoins(coins)
      if (isAstroLp) simulateAstroLpDeposit(farm.denoms.lp, depositCoins, coins)
      else simulateVaultDeposit(farm.address, coins, borrowCoins)
    },
    [
      borrowCoins,
      depositCoins,
      farm.address,
      farm.denoms.lp,
      isAstroLp,
      simulateAstroLpDeposit,
      simulateVaultDeposit,
    ],
  )

  const getDepositSubTitle = useCallback(() => {
    if (isOpen[0] && isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[0]) return null
    if (!primaryAsset || !secondaryAsset) return null
    return (
      <FarmDepositsSubTitle
        primaryAmount={
          deposits.find((coin) => coin.denom === primaryAsset.denom)?.amount || BN_ZERO
        }
        secondaryAmount={
          deposits.find((coin) => coin.denom === secondaryAsset.denom)?.amount || BN_ZERO
        }
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        displayCurrency={displayCurrency}
      />
    )
  }, [deposits, displayCurrency, isDeposited, isOpen, primaryAsset, secondaryAsset])

  const getBorrowingsSubTitle = useCallback(() => {
    if (isOpen[1] && isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[1]) return null

    return <FarmBorrowingsSubTitle borrowings={addedDebts} displayCurrency={displayCurrency} />
  }, [addedDebts, displayCurrency, isDeposited, isOpen])

  const items = useMemo(() => {
    if (!primaryAsset || !secondaryAsset) return []
    return [
      {
        renderContent: () => (
          <FarmDeposits
            deposits={depositCoins}
            onChangeDeposits={onChangeDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            account={account}
            toggleOpen={toggleOpen}
            isCustomRatio={isCustomRatio}
            onChangeIsCustomRatio={onChangeIsCustomRatio}
            depositCapReachedCoins={depositCapReachedCoins}
          />
        ),
        title: 'Deposit',
        renderSubTitle: getDepositSubTitle,
        isOpen: isOpen[0],
        toggleOpen: (index: number) => toggleOpen(index),
      },
      {
        renderContent: () => (
          <FarmBorrowings
            account={account}
            borrowings={borrowCoins}
            reclaims={removedLends}
            deposits={removedDeposits}
            primaryAsset={primaryAsset}
            secondaryAsset={secondaryAsset}
            onChangeBorrowings={onChangeBorrowings}
            farm={farm}
            depositCapReachedCoins={depositCapReachedCoins}
            displayCurrency={displayCurrency}
            totalValue={totalValue}
            type={isAstroLp ? 'astroLp' : 'vault'}
          />
        ),
        title: 'Borrow',
        renderSubTitle: getBorrowingsSubTitle,
        isOpen: isOpen[1],
        toggleOpen: (index: number) => toggleOpen(index),
      },
    ]
  }, [
    account,
    borrowCoins,
    depositCapReachedCoins,
    depositCoins,
    displayCurrency,
    farm,
    getBorrowingsSubTitle,
    getDepositSubTitle,
    isAstroLp,
    isCustomRatio,
    isOpen,
    onChangeBorrowings,
    onChangeDeposits,
    onChangeIsCustomRatio,
    primaryAsset,
    removedDeposits,
    removedLends,
    secondaryAsset,
    toggleOpen,
    totalValue,
  ])

  return (
    <div
      className={classNames(
        'flex items-start flex-1 p-2 gap-4 flex-wrap',
        'md:p-4 md:gap-6',
        'lg:flex-nowrap lg:p-6',
      )}
    >
      <Accordion className='h-[546px] overflow-y-scroll scrollbar-hide flex-1' items={items} />
      <AccountSummaryInModal account={account} />
    </div>
  )
}
