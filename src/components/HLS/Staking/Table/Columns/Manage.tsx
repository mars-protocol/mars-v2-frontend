import React from 'react'

import DropDownButton from 'components/Button/DropDownButton'
import { ArrowDownLine, HandCoins, Plus } from 'components/Icons'

export const MANAGE_META = { id: 'manage' }

const ITEMS: DropDownItem[] = [
  {
    icon: <Plus width={16} />,
    text: 'Deposit more',
    onClick: () => {},
  },
  {
    icon: <HandCoins />,
    text: 'Repay',
    onClick: () => {},
  },
  {
    icon: <ArrowDownLine />,
    text: 'Withdraw',
    onClick: () => {},
  },
]

interface Props {
  account: HLSAccountWithStrategy
}

export default function Manage(props: Props) {
  return <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
}
