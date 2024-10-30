import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, Cross, HandCoins, Plus, Scale } from 'components/common/Icons'
import { useCallback, useMemo } from 'react'
import useStore from 'store'

export const MANAGE_META = {
  id: 'manage',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

interface Props {
  account: HlsAccountWithStrategy
}

export default function Manage(props: Props) {
  const openModal = useCallback(
    (action: HlsStakingManageAction) =>
      useStore.setState({
        hlsManageModal: {
          accountId: props.account.id,
          staking: { strategy: props.account.strategy },
          action,
        },
      }),
    [props.account.id, props.account.strategy],
  )

  const closeHlsStakingPosition = useCallback(() => {
    useStore.setState({
      hlsCloseModal: {
        account: props.account,
        staking: { strategy: props.account.strategy },
      },
    })
  }, [props.account])

  const hasNoDebt = useMemo(() => props.account.debts.length === 0, [props.account.debts.length])

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Scale width={16} />,
        text: 'Change leverage',
        onClick: () => openModal('leverage'),
      },
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
        onClick: () => closeHlsStakingPosition(),
      },
    ],
    [closeHlsStakingPosition, hasNoDebt, openModal],
  )

  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
