import React, { useMemo } from 'react'

import DropDownButton from 'components/Button/DropDownButton'
import { Cross, Edit } from 'components/Icons'
import { PerpPositionRow } from 'components/Perps/BalancesTable/usePerpsBalancesData'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

export const MANAGE_META = { id: 'manage', header: 'Manage' }

interface Props {
  perpPosition: PerpPositionRow
}

export default function Manage(props: Props) {
  const currentAccount = useCurrentAccount()

  const closePerpPosition = useStore((s) => s.closePerpPosition)
  const ITEMS: DropDownItem[] = useMemo(
    () => [
      {
        icon: <Edit />,
        text: 'Edit Position Size',
        onClick: () => {},
      },
      {
        icon: <Cross width={16} />,
        text: 'Close Position',
        onClick: async () => {
          if (!currentAccount) return
          await closePerpPosition({
            accountId: currentAccount.id,
            denom: props.perpPosition.asset.denom,
          })
        },
      },
    ],
    [closePerpPosition, currentAccount, props.perpPosition.asset.denom],
  )

  return (
    <div className='flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
