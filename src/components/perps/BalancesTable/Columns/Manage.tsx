import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowRight, Cross, Edit, Shield, SwapIcon } from 'components/common/Icons'
import Text from 'components/common/Text'
import PerpsSlTpModal from 'components/Modals/PerpsSlTpModal'
import ConfirmationSummary from 'components/perps/Module/ConfirmationSummary'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
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

  const cancelTriggerOrder = useStore((s) => s.cancelTriggerOrder)
  const closePerpPosition = useStore((s) => s.closePerpPosition)

  const { open: openAlertDialog, close } = useAlertDialog()

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
    })
  }, [
    currentAccount,
    closePerpPosition,
    isAutoLendEnabledForCurrentAccount,
    perpPosition,
    limitOrders,
  ])

  const isPerpsSlTpModalOpen = useStore((s) => s.addSLTPModal.open)
  const openPerpsSlTpModal = useCallback((parentPosition: PerpPositionRow) => {
    useStore.setState({ addSLTPModal: { open: true, parentPosition } })
  }, [])

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
      openAlertDialog({
        header: <Text size='2xl'>Warning</Text>,
        content: (
          <Text>
            Closing this position will also cancel all related limit orders. Do you want to
            continue?
          </Text>
        ),
        positiveButton: {
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: closePosition,
        },
        negativeButton: {
          text: 'Cancel',
          onClick: close,
        },
        showCloseButton: true,
      })
      return
    }

    if (!showSummary) {
      closePosition()
      return
    }

    openAlertDialog({
      header: <Text size='2xl'>Order Summary</Text>,
      content: (
        <ConfirmationSummary
          amount={perpPosition.amount.negated()}
          accountId={currentAccount.id}
          asset={perpPosition.asset}
          leverage={perpPosition.leverage}
        />
      ),
      positiveButton: {
        text: 'Confirm',
        icon: <ArrowRight />,
        onClick: closePosition,
      },
      checkbox: {
        text: 'Hide summary in the future',
        onClick: (isChecked: boolean) => setShowSummary(!isChecked),
      },
      isSingleButtonLayout: true,
      showCloseButton: true,
    })
  }, [
    close,
    closePosition,
    currentAccount,
    openAlertDialog,
    perpPosition,
    setShowSummary,
    showSummary,
    limitOrders,
  ])

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
        })
      }

      if (!showSummary && hasOpenOrders) {
        openAlertDialog({
          header: <Text size='2xl'>Warning</Text>,
          content: (
            <Text>
              Flipping this position will also cancel all related limit orders. Do you want to
              continue?
            </Text>
          ),
          positiveButton: {
            text: 'Continue',
            icon: <ArrowRight />,
            onClick: executeFlip,
          },
          negativeButton: {
            text: 'Cancel',
            onClick: close,
          },
          showCloseButton: true,
        })
        return
      }

      if (!showSummary) {
        executeFlip()
        return
      }

      openAlertDialog({
        header: <Text size='2xl'>Order Summary</Text>,
        content: (
          <ConfirmationSummary
            amount={signedAmount}
            accountId={currentAccount.id}
            asset={perpPosition.asset}
            leverage={perpPosition.leverage}
          />
        ),
        positiveButton: {
          text: 'Continue',
          icon: <ArrowRight />,
          onClick: executeFlip,
        },
        checkbox: {
          text: 'Hide summary in the future',
          onClick: (isChecked: boolean) => setShowSummary(!isChecked),
        },
        isSingleButtonLayout: true,
        showCloseButton: true,
      })
    },
    [
      currentAccount,
      perpPosition,
      limitOrders,
      showSummary,
      openAlertDialog,
      close,
      closePerpPosition,
      isAutoLendEnabledForCurrentAccount,
      setShowSummary,
    ],
  )

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(perpPosition.asset.isDeprecated
        ? [
            {
              icon: <Shield />,
              text: 'Add Stop Loss',
              onClick: () => {
                openPerpsSlTpModal(perpPosition)
              },
            },
          ]
        : [
            ...(searchParams.get(SearchParams.PERPS_MARKET) === perpPosition.asset.denom
              ? [
                  // Remove SL/TP for the moment
                  // {
                  //   icon: <Shield />,
                  //   text: 'Add Stop Loss',
                  //   onClick: openPerpsSlTpModal,
                  // },
                ]
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
                  // {
                  //   icon: <Shield />,
                  //   text: 'Add Stop Loss',
                  //   onClick: openPerpsSlTpModal,
                  // },
                ]),
            {
              icon: <SwapIcon />,
              text: 'Flip Direction',
              onClick: () => {
                const newDirection = perpPosition.tradeDirection === 'long' ? 'short' : 'long'
                handleFlipPosition(newDirection)
              },
            },
            {
              icon: <Shield />,
              text: 'Add Stop Loss',
              onClick: () => {
                openPerpsSlTpModal(perpPosition)
              },
            },
          ]),
      {
        icon: <Cross width={16} />,
        text: 'Close Position',
        onClick: () => handleCloseClick(),
      },
    ],
    [
      handleCloseClick,
      handleFlipPosition,
      openPerpsSlTpModal,
      perpPosition,
      searchParams,
      setSearchParams,
    ],
  )

  if (props.perpPosition.type === 'limit' || props.perpPosition.type === 'stop')
    return (
      <div className='flex justify-end'>
        <ActionButton
          text='Cancel'
          onClick={async () => {
            if (!props.perpPosition.orderId || !currentAccount) return
            setIsConfirming(true)
            await cancelTriggerOrder({
              accountId: currentAccount.id,
              orderId: props.perpPosition.orderId,
              autolend: isAutoLendEnabledForCurrentAccount,
              baseDenom: perpPosition.baseDenom,
            })
            setIsConfirming(false)
          }}
          className='min-w-[105px]'
          color='tertiary'
          showProgressIndicator={isConfirming}
        />
      </div>
    )

  return (
    <div className='flex justify-end' onClick={(e) => e.stopPropagation()}>
      {isPerpsSlTpModalOpen && <PerpsSlTpModal />}
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
