import React, { useCallback, useMemo } from 'react'

import DropDownButton from 'components/Button/DropDownButton'
import { ArrowDownLine, HandCoins, Plus } from 'components/Icons'
import useStore from 'store'

export const MANAGE_META = { id: 'manage' }

interface Props {
  account: HLSAccountWithStrategy
}

export default function Manage(props: Props) {
  const openModal = useCallback(
    (action: 'deposit' | 'withdraw' | 'repay') =>
      useStore.setState({
        hlsManageModal: { staking: { strategy: props.account.strategy, action } },
      }),
    [props.account.strategy],
  )

  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Plus width={16} />,
        text: 'Deposit more',
        onClick: () => openModal('deposit'),
      },
      {
        icon: <HandCoins />,
        text: 'Repay',
        onClick: () => openModal('repay'),
      },
      {
        icon: <ArrowDownLine />,
        text: 'Withdraw',
        onClick: () => openModal('withdraw'),
      },
    ],
    [openModal],
  )

  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
