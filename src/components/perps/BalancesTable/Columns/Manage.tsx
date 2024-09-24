import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { Check, Cross, Edit } from 'components/common/Icons'
import Text from 'components/common/Text'
import TradeDirection from 'components/perps/BalancesTable/Columns/TradeDirection'
import ConfirmationSummary from 'components/perps/Module/ConfirmationSummary'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'

export const MANAGE_META = { id: 'manage', header: 'Manage', meta: { className: 'w-40 min-w-40' } }

interface Props {
  perpPosition: PerpPositionRow
}

export default function Manage(props: Props) {
  const currentAccount = useCurrentAccount()
  const chainConfig = useChainConfig()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isConfirming, setIsConfirming] = useState<boolean>(false)

  const [showSummary, setShowSummary] = useLocalStorage<boolean>(
    LocalStorageKeys.SHOW_SUMMARY,
    getDefaultChainSettings(chainConfig).showSummary,
  )
  const executePerpOrder = useStore((s) => s.executePerpOrder)

  const { open: openAlertDialog, close } = useAlertDialog()

  const closePosition = useCallback(() => {
    if (!currentAccount) return
    executePerpOrder({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(
        props.perpPosition.asset.denom,
        props.perpPosition.amount.negated(),
      ),
    })
  }, [currentAccount, executePerpOrder, props.perpPosition.amount, props.perpPosition.asset.denom])
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
            tradeDirection={props.perpPosition.tradeDirection}
            className='capitalize !text-sm'
          />
        </div>
      ),
      content: (
        <ConfirmationSummary
          amount={props.perpPosition.amount.negated()}
          accountId={currentAccount.id}
          asset={props.perpPosition.asset}
          leverage={props.perpPosition.leverage}
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
    props.perpPosition.amount,
    props.perpPosition.asset,
    props.perpPosition.leverage,
    props.perpPosition.tradeDirection,
    setShowSummary,
    showSummary,
  ])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      ...(searchParams.get(SearchParams.PERPS_MARKET) === props.perpPosition.asset.denom
        ? []
        : [
            {
              icon: <Edit />,
              text: 'Edit Position Size',
              onClick: () => {
                const params = getSearchParamsObject(searchParams)
                setSearchParams({
                  ...params,
                  [SearchParams.PERPS_MARKET]: props.perpPosition.asset.denom,
                })
              },
            },
          ]),
      {
        icon: <Cross width={16} />,
        text: 'Close Position',
        onClick: () => handleCloseClick(),
      },
    ],
    [handleCloseClick, props.perpPosition.asset.denom, searchParams, setSearchParams],
  )

  if (props.perpPosition.type === 'limit')
    return (
      <div className='flex justify-end'>
        <ActionButton
          text='Cancel'
          onClick={async () => {
            //if (!props.perpPosition.orderId || !currentAccount) return
            setIsConfirming(true)
            //await cancelTriggerOrder({
            //  accountId: currentAccount.id,
            //  orderId: props.perpPosition.orderId,
            //})
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
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
