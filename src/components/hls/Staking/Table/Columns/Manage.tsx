import DropDownButton from 'components/common/Button/DropDownButton'
import { ArrowDownLine, Cross, HandCoins, Plus, Scale } from 'components/common/Icons'
import useCloseHlsStakingPosition from 'hooks/hls/useClosePositionActions'
import React, { useCallback, useMemo } from 'react'
import useStore from 'store'

export const MANAGE_META = { id: 'manage' }

interface Props {
  account: HLSAccountWithStrategy
}

export default function Manage(props: Props) {
  const openModal = useCallback(
    (action: HlsStakingManageAction) =>
      useStore.setState({
        hlsManageModal: {
          accountId: props.account.id,
          staking: { strategy: props.account.strategy, action },
        },
      }),
    [props.account.id, props.account.strategy],
  )

  const actions = useCloseHlsStakingPosition({ account: props.account })

  const closeHlsStakingPosition = useStore((s) => s.closeHlsStakingPosition)

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
        onClick: () => actions && closeHlsStakingPosition({ accountId: props.account.id, actions }),
      },
    ],
    [actions, closeHlsStakingPosition, hasNoDebt, openModal, props.account.id],
  )

  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
