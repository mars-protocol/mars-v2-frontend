import React, { useCallback, useMemo } from 'react'

import DropDownButton from 'components/Button/DropDownButton'
import { ArrowDownLine, Cross, HandCoins, Plus, Scale } from 'components/Icons'
import useCloseHlsStakingPosition from 'hooks/HLS/useClosePositionActions'
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
      {
        icon: <HandCoins width={16} />,
        text: 'Repay',
        onClick: () => openModal('repay'),
      },
      {
        icon: <ArrowDownLine width={16} />,
        text: 'Withdraw',
        onClick: () => openModal('withdraw'),
      },
      {
        icon: <Cross width={14} />,
        text: 'Close Position',
        onClick: () => closeHlsStakingPosition({ accountId: props.account.id, actions }),
      },
    ],
    [actions, closeHlsStakingPosition, openModal, props.account.id],
  )

  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
