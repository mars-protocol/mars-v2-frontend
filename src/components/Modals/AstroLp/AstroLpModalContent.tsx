import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import AstroLpBorrowings from 'components/Modals/AstroLp/AstroLpBorrowings'
import AstroLpBorrowingsSubTitle from 'components/Modals/AstroLp/AstroLpBorrowingsSubTitle'
import AstroLpDeposit from 'components/Modals/AstroLp/AstroLpDeposits'
import AstroLpDepositSubTitle from 'components/Modals/AstroLp/AstroLpDepositsSubTitle'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Accordion from 'components/common/Accordion'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useDisplayAsset from 'hooks/assets/useDisplayAsset'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useDepositLiquidity from 'hooks/broadcast/useDepositLiquidity'
import useIsOpenArray from 'hooks/common/useIsOpenArray'
import useDisplayCurrency from 'hooks/localStorage/useDisplayCurrency'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAstroLpSharesFromCoinsValue } from 'utils/astroLps'
import { getCoinValue, magnify } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  astroLp: AstroLp | DepositedAstroLp
  account: Account
  isDeposited?: boolean
}

export default function AstroLpModalContent(props: Props) {
  const { addedDebts, removedDeposits, removedLends, simulateAstroLpDeposit } = useUpdatedAccount(
    props.account,
  )
  const assets = useWhitelistedAssets()
  const [displayCurrency] = useDisplayCurrency()
  const [isOpen, toggleOpen] = useIsOpenArray(2, false)
  const [isCustomRatio, setIsCustomRatio] = useState(false)
  const [depositCoins, setDepositCoins] = useState<BNCoin[]>([])
  const [borrowCoins, setBorrowCoins] = useState<BNCoin[]>([])
  const displayAsset = useDisplayAsset()
  const { actions: depositActions, totalValue } = useDepositLiquidity({
    pool: props.astroLp,
    reclaims: removedLends,
    deposits: removedDeposits,
    borrowings: addedDebts,
    kind: 'default' as AccountKind,
    isAstroLp: true,
  })
  const primaryAsset = assets.find(byDenom(props.astroLp.denoms.primary))
  const secondaryAsset = assets.find(byDenom(props.astroLp.denoms.secondary))
  const depositCapReachedCoins = useMemo(() => {
    if (!props.astroLp.cap) return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, BN_ZERO)]

    const capLeft = getCapLeftWithBuffer(props.astroLp.cap)
    const totalShares = getAstroLpSharesFromCoinsValue(props.astroLp, totalValue, assets)

    if (totalShares.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(
          BNCoin.fromDenomAndBigNumber(props.astroLp.cap.denom, capLeft),
          assets,
        ).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }
    return []
  }, [assets, displayAsset, totalValue, props.astroLp])

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
      simulateAstroLpDeposit(props.astroLp.denoms.lp, coins, borrowCoins)
    },
    [borrowCoins, props.astroLp.denoms.lp, simulateAstroLpDeposit],
  )

  const onChangeBorrowings = useCallback(
    (coins: BNCoin[]) => {
      setBorrowCoins(coins)
      simulateAstroLpDeposit(props.astroLp.denoms.lp, depositCoins, coins)
    },
    [depositCoins, props.astroLp.denoms.lp, simulateAstroLpDeposit],
  )

  function getDepositSubTitle() {
    if (isOpen[0] && props.isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[0]) return null
    if (!primaryAsset || !secondaryAsset) return null
    return (
      <AstroLpDepositSubTitle
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
  }

  function getBorrowingsSubTitle() {
    if (isOpen[1] && props.isDeposited)
      return (
        <Text size='xs' className='mt-1 text-white/60'>
          The amounts you enter below will be added to your current position.
        </Text>
      )

    if (isOpen[1]) return null

    return <AstroLpBorrowingsSubTitle borrowings={addedDebts} displayCurrency={displayCurrency} />
  }

  if (!primaryAsset || !secondaryAsset) return null
  return (
    <div
      className={classNames(
        'flex items-start flex-1 p-2 gap-4 flex-wrap',
        'md:p-4 md:gap-6',
        'lg:flex-nowrap lg:p-6',
      )}
    >
      <Accordion
        className='h-[546px] overflow-y-scroll scrollbar-hide flex-1'
        items={[
          {
            renderContent: () => (
              <AstroLpDeposit
                deposits={depositCoins}
                onChangeDeposits={onChangeDeposits}
                primaryAsset={primaryAsset}
                secondaryAsset={secondaryAsset}
                account={props.account}
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
              <AstroLpBorrowings
                account={props.account}
                borrowings={borrowCoins}
                deposits={deposits}
                primaryAsset={primaryAsset}
                secondaryAsset={secondaryAsset}
                onChangeBorrowings={onChangeBorrowings}
                astroLp={props.astroLp}
                depositActions={depositActions}
                depositCapReachedCoins={depositCapReachedCoins}
                displayCurrency={displayCurrency}
                totalValue={totalValue}
              />
            ),
            title: 'Borrow',
            renderSubTitle: getBorrowingsSubTitle,
            isOpen: isOpen[1],
            toggleOpen: (index: number) => toggleOpen(index),
          },
        ]}
      />
      <AccountSummaryInModal account={props.account} />
    </div>
  )
}
