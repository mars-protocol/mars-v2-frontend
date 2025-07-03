import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import AlertDialog from 'components/common/AlertDialog'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowRight, Cross, Edit, SwapIcon } from 'components/common/Icons'
import Text from 'components/common/Text'
import PerpsSlTpModal from 'components/Modals/PerpsSlTpModal'
import ConfirmationSummary from 'components/perps/Module/ConfirmationSummary'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'

export const MANAGE_META = { id: 'manage', header: 'Manage', meta: { className: 'w-40 min-w-30' } }

interface Props {
  perpPosition: PerpPositionRow
}

interface AlertState {
  isOpen: boolean
  type: 'warning' | 'summary' | 'flip-warning' | 'flip-summary'
  flipDirection?: 'long' | 'short'
}

export default function Manage(props: Props) {
  const { perpPosition } = props
  const currentAccount = useCurrentAccount()
  const chainConfig = useChainConfig()
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isConfirming, setIsConfirming] = useState<boolean>(false)
  const { data: limitOrders } = usePerpsLimitOrders()
  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    `${chainConfig.id}/${LocalStorageKeys.SHOW_SUMMARY}`,
    getDefaultChainSettings(chainConfig).showSummary,
  )
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'warning',
  })

  const cancelTriggerOrder = useStore((s) => s.cancelTriggerOrder)
  const closePerpPosition = useStore((s) => s.closePerpPosition)

  const closePosition = useCallback(() => {
    if (!currentAccount || !limitOrders) return

    const relevantOrderIds = limitOrders
      .filter((order) =>
        order.order.actions.some(
          (action) =>
            'execute_perp_order' in action &&
            action.execute_perp_order.denom === perpPosition.asset.denom,
        ),
      )
      .map((order) => order.order.order_id)

    closePerpPosition({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(perpPosition.asset.denom, perpPosition.amount.negated()),
      autolend: isAutoLendEnabledForCurrentAccount,
      baseDenom: perpPosition.baseDenom,
      orderIds: relevantOrderIds,
      position: perpPosition,
      debt: currentAccount.debts.find((debt) => debt.denom === perpPosition.baseDenom),
    })
  }, [
    currentAccount,
    closePerpPosition,
    isAutoLendEnabledForCurrentAccount,
    perpPosition,
    limitOrders,
  ])

  const isPerpsSlTpModalOpen = useStore((s) => s.addSLTPModal)

  const handleCloseClick = useCallback(() => {
    if (!currentAccount) return

    const hasOpenOrders = limitOrders?.some((order) =>
      order.order.actions.some(
        (action) =>
          'execute_perp_order' in action &&
          action.execute_perp_order.denom === perpPosition.asset.denom,
      ),
    )

    if (!showSummary && hasOpenOrders) {
      setAlertState({ isOpen: true, type: 'warning' })
      return
    }

    if (!showSummary) {
      closePosition()
      return
    }

    setAlertState({ isOpen: true, type: 'summary' })
  }, [closePosition, currentAccount, perpPosition, showSummary, limitOrders])

  const handleFlipPosition = useCallback(
    (newDirection: 'long' | 'short') => {
      if (!currentAccount) return
      const flipAmount = perpPosition.amount.times(2)
      const signedAmount = newDirection === 'long' ? flipAmount.abs() : flipAmount.abs().negated()

      const hasOpenOrders = limitOrders?.some((order) =>
        order.order.actions.some(
          (action) =>
            'execute_perp_order' in action &&
            action.execute_perp_order.denom === perpPosition.asset.denom,
        ),
      )

      const executeFlip = () => {
        closePerpPosition({
          accountId: currentAccount.id,
          coin: BNCoin.fromDenomAndBigNumber(perpPosition.asset.denom, signedAmount),
          autolend: isAutoLendEnabledForCurrentAccount,
          baseDenom: perpPosition.baseDenom,
          position: perpPosition,
          debt: currentAccount.debts.find((debt) => debt.denom === perpPosition.baseDenom),
        })
      }

      if (!showSummary && hasOpenOrders) {
        setAlertState({ isOpen: true, type: 'flip-warning', flipDirection: newDirection })
        return
      }

      if (!showSummary) {
        executeFlip()
        return
      }

      setAlertState({ isOpen: true, type: 'flip-summary', flipDirection: newDirection })
    },
    [
      currentAccount,
      perpPosition,
      limitOrders,
      showSummary,
      closePerpPosition,
      isAutoLendEnabledForCurrentAccount,
    ],
  )

  const handleAlertClose = () => {
    setAlertState({ isOpen: false, type: 'warning' })
  }

  const handleAlertConfirm = () => {
    if (alertState.type === 'warning' || alertState.type === 'summary') {
      closePosition()
    } else if (alertState.type === 'flip-warning' || alertState.type === 'flip-summary') {
      if (alertState.flipDirection && currentAccount) {
        const flipAmount = perpPosition.amount.times(2)
        const signedAmount =
          alertState.flipDirection === 'long' ? flipAmount.abs() : flipAmount.abs().negated()

        closePerpPosition({
          accountId: currentAccount.id,
          coin: BNCoin.fromDenomAndBigNumber(perpPosition.asset.denom, signedAmount),
          autolend: isAutoLendEnabledForCurrentAccount,
          baseDenom: perpPosition.baseDenom,
          position: perpPosition,
          debt: currentAccount.debts.find((debt) => debt.denom === perpPosition.baseDenom),
        })
      }
    }
    handleAlertClose()
  }

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(perpPosition.asset.isDeprecated
        ? []
        : [
            ...(searchParams.get(SearchParams.PERPS_MARKET) === perpPosition.asset.denom
              ? []
              : [
                  {
                    icon: <Edit />,
                    text: 'Edit Position',
                    onClick: () => {
                      const params = getSearchParamsObject(searchParams)
                      setSearchParams({
                        ...params,
                        [SearchParams.PERPS_MARKET]: perpPosition.asset.denom,
                      })
                    },
                  },
                ]),
            {
              icon: <SwapIcon />,
              text: 'Flip Direction',
              onClick: () => {
                const newDirection = perpPosition.tradeDirection === 'long' ? 'short' : 'long'
                handleFlipPosition(newDirection)
              },
            },
          ]),
      {
        icon: <Cross />,
        text: 'Close Position',
        onClick: handleCloseClick,
      },
    ],
    [
      handleCloseClick,
      handleFlipPosition,
      perpPosition.asset.denom,
      perpPosition.asset.isDeprecated,
      perpPosition.tradeDirection,
      searchParams,
      setSearchParams,
    ],
  )

  const getAlertContent = () => {
    if (!currentAccount) return null

    switch (alertState.type) {
      case 'warning':
        return (
          <Text>
            Closing this position will also cancel all related limit orders. Do you want to
            continue?
          </Text>
        )
      case 'summary':
        return (
          <ConfirmationSummary
            amount={perpPosition.amount.negated()}
            accountId={currentAccount.id}
            asset={perpPosition.asset}
            leverage={perpPosition.leverage}
          />
        )
      case 'flip-warning':
        return (
          <Text>
            Flipping this position will also cancel all related limit orders. Do you want to
            continue?
          </Text>
        )
      case 'flip-summary':
        if (alertState.flipDirection) {
          const flipAmount = perpPosition.amount.times(2)
          const signedAmount =
            alertState.flipDirection === 'long' ? flipAmount.abs() : flipAmount.abs().negated()
          return (
            <ConfirmationSummary
              amount={signedAmount}
              accountId={currentAccount.id}
              asset={perpPosition.asset}
              leverage={perpPosition.leverage}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  const getAlertTitle = () => {
    switch (alertState.type) {
      case 'warning':
      case 'flip-warning':
        return 'Warning'
      case 'summary':
      case 'flip-summary':
        return 'Order Summary'
      default:
        return ''
    }
  }

  return (
    <>
      <div className='flex justify-end'>
        {isConfirming ? (
          <div className='text-white/60'>Confirming...</div>
        ) : (
          <DropDownButton
            items={ITEMS}
            color='tertiary'
            text='Manage'
            className='w-full min-w-20'
          />
        )}
        {isPerpsSlTpModalOpen && <PerpsSlTpModal />}
      </div>

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        header={<Text size='2xl'>{getAlertTitle()}</Text>}
        content={getAlertContent() || <Text>Error loading content</Text>}
        positiveButton={{
          text: alertState.type.includes('summary') ? 'Confirm' : 'Continue',
          icon: <ArrowRight />,
          onClick: handleAlertConfirm,
        }}
        negativeButton={{
          text: 'Cancel',
          onClick: handleAlertClose,
        }}
        checkbox={
          alertState.type.includes('summary')
            ? {
                text: 'Hide summary in the future',
                onClick: (isChecked: boolean) => setShowSummary(!isChecked),
              }
            : undefined
        }
        isSingleButtonLayout={alertState.type.includes('summary')}
        showCloseButton
      />
    </>
  )
}
