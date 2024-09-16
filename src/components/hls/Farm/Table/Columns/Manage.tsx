import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, Cross, HandCoins, Plus } from 'components/common/Icons'
import { useCallback, useMemo } from 'react'
import useStore from 'store'

export const MANAGE_META = {
  id: 'manage',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

interface Props {
  hlsFarm: DepositedHlsFarm
}

export default function Manage(props: Props) {
  const openModal = useCallback(
    (action: HlsStakingManageAction) => {
      switch (action) {
        case 'deposit':
        case 'withdraw':
          useStore.setState({
            farmModal: {
              farm: props.hlsFarm.farm,
              selectedBorrowDenoms: [props.hlsFarm.borrowAsset.denom],
              account: props.hlsFarm.account,
              maxLeverage: props.hlsFarm.maxLeverage,
              action: action,
              type: 'high_leverage',
            },
          })
          break
        default:
          useStore.setState({
            hlsManageModal: {
              accountId: props.hlsFarm.account.id,
              farming: props.hlsFarm,
              action,
            },
          })
          break
      }
    },
    [props.hlsFarm],
  )

  const closeHlsFarmingPosition = useCallback(() => {
    useStore.setState({
      hlsCloseModal: {
        account: props.hlsFarm.account,
        farming: props.hlsFarm,
      },
    })
  }, [props.hlsFarm])

  const hasNoDebt = useMemo(
    () => props.hlsFarm.account.debts.length === 0,
    [props.hlsFarm.account.debts.length],
  )

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Plus width={16} />,
        text: 'Deposit more',
        onClick: () => openModal('deposit'),
      },
      ...(hasNoDebt
        ? []
        : [
            {
              icon: <HandCoins width={16} />,
              text: 'Repay',
              onClick: () => openModal('repay'),
            },
          ]),
      {
        icon: <ArrowDownLine width={16} />,
        text: 'Withdraw',
        onClick: () => openModal('withdraw'),
      },
      {
        icon: <Cross width={14} />,
        text: 'Close Position',
        onClick: () => closeHlsFarmingPosition(),
      },
    ],
    [closeHlsFarmingPosition, hasNoDebt, openModal],
  )

  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
