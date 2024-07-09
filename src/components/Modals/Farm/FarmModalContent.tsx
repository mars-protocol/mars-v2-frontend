import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import FarmBorrowings from 'components/Modals/Farm/FarmBorrowings'
import FarmBorrowingsSubTitle from 'components/Modals/Farm/FarmBorrowingsSubTitle'
import FarmDeposit from 'components/Modals/Farm/FarmDeposits'
import FarmDepositSubTitle from 'components/Modals/Farm/FarmDepositsSubTitle'
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
import { getFarmSharesFromCoinsValue } from 'utils/farms'
import { getCoinValue, magnify } from 'utils/formatters'
import { getCapLeftWithBuffer } from 'utils/generic'
import { mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  farm: Farm | DepositedFarm
  account: Account
  isDeposited?: boolean
}

export default function FarmModalContent(props: Props) {
  const { addedDebts, removedDeposits, removedLends, simulateFarmDeposit } = useUpdatedAccount(
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
    pool: props.farm,
    reclaims: removedLends,
    deposits: removedDeposits,
    borrowings: addedDebts,
    kind: 'default' as AccountKind,
    isFarm: true,
  })
  const primaryAsset = assets.find(byDenom(props.farm.denoms.primary))
  const secondaryAsset = assets.find(byDenom(props.farm.denoms.secondary))
  const depositCapReachedCoins = useMemo(() => {
    if (!props.farm.cap) return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, BN_ZERO)]

    const capLeft = getCapLeftWithBuffer(props.farm.cap)
    const totalShares = getFarmSharesFromCoinsValue(props.farm, totalValue, assets)

    if (totalShares.isGreaterThan(capLeft)) {
      const amount = magnify(
        getCoinValue(
          BNCoin.fromDenomAndBigNumber(props.farm.cap.denom, capLeft),
          assets,
        ).toString(),
        displayAsset,
      )

      return [BNCoin.fromDenomAndBigNumber(displayAsset.denom, amount)]
    }
    return []
  }, [assets, displayAsset, totalValue, props.farm])

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
      simulateFarmDeposit(props.farm.denoms.lp, coins, borrowCoins)
    },
    [borrowCoins, props.farm.denoms.lp, simulateFarmDeposit],
  )

  const onChangeBorrowings = useCallback(
    (coins: BNCoin[]) => {
      setBorrowCoins(coins)
      simulateFarmDeposit(props.farm.denoms.lp, depositCoins, coins)
    },
    [depositCoins, props.farm.denoms.lp, simulateFarmDeposit],
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
      <FarmDepositSubTitle
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

    return <FarmBorrowingsSubTitle borrowings={addedDebts} displayCurrency={displayCurrency} />
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
              <FarmDeposit
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
              <FarmBorrowings
                account={props.account}
                borrowings={borrowCoins}
                deposits={deposits}
                primaryAsset={primaryAsset}
                secondaryAsset={secondaryAsset}
                onChangeBorrowings={onChangeBorrowings}
                farm={props.farm}
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
