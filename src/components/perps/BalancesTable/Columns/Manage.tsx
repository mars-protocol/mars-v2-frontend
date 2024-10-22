import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { Check, Cross, Edit, Shield } from 'components/common/Icons'
import Text from 'components/common/Text'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import ConfirmationSummary from 'components/perps/Module/ConfirmationSummary'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'
import PerpsSlTpModal from 'components/Modals/PerpsSlTpModal'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'

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
    LocalStorageKeys.SHOW_SUMMARY,
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
  const isPerpsSlTpModalOpen = useStore((s) => s.addSLTPModal)

  const handleCloseClick = useCallback(() => {
    if (!currentAccount) return
    if (!showSummary) {
      closePosition()
      return
    }
    openAlertDialog({
      header: (
        <div className='flex items-center justify-between w-full'>
          <Text size='2xl'>Order Summary</Text>
          <TradeDirection
            tradeDirection={perpPosition.tradeDirection}
            className='capitalize !text-sm'
          />
        </div>
      ),
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
        icon: <Check />,
        onClick: closePosition,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          close()
        },
      },
      checkbox: {
        text: 'Hide summary in the future',
        onClick: (isChecked: boolean) => setShowSummary(!isChecked),
      },
    })
  }, [
    close,
    closePosition,
    currentAccount,
    openAlertDialog,
    perpPosition.amount,
    perpPosition.asset,
    perpPosition.leverage,
    perpPosition.tradeDirection,
    setShowSummary,
    showSummary,
  ])

  const openPerpsSlTpModal = useCallback(() => {
    useStore.setState({ addSLTPModal: true })
  }, [])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(searchParams.get(SearchParams.PERPS_MARKET) === perpPosition.asset.denom
        ? [
            // Remove SL/TP for the moment
            // {
            //   icon: <Shield />,
            //   text: 'Add SL/TP',
            //   onClick: openPerpsSlTpModal,
            // },
          ]
        : [
            {
              icon: <Edit />,
              text: 'Edit Position Size',
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
            //   text: 'Add SL/TP',
            //   onClick: openPerpsSlTpModal,
            // },
          ]),
      {
        icon: <Cross width={16} />,
        text: 'Close Position',
        onClick: () => handleCloseClick(),
      },
    ],
    [
      handleCloseClick,
      // openPerpsSlTpModal,
      perpPosition.asset.denom,
      searchParams,
      setSearchParams,
    ],
  )

  if (props.perpPosition.type === 'limit')
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
    <div className='flex justify-end'>
      {isPerpsSlTpModalOpen && <PerpsSlTpModal />}
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
