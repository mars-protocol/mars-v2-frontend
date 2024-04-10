import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ActionButton from 'components/common/Button/ActionButton'
import DropDownButton from 'components/common/Button/DropDownButton'
import { Cross, Edit } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'
import { SearchParams } from 'types/enums/searchParams'
import { getSearchParamsObject } from 'utils/route'

export const MANAGE_META = { id: 'manage', header: 'Manage', meta: { className: 'w-40 min-w-40' } }

interface Props {
  perpPosition: PerpPositionRow
}

export default function Manage(props: Props) {
  const currentAccount = useCurrentAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isConfirming, setIsConfirming] = useState<boolean>(false)

  const closePerpPosition = useStore((s) => s.closePerpPosition)
  const cancelTriggerOrder = useStore((s) => s.cancelTriggerOrder)
  const ITEMS: DropDownItem[] = useMemo(
    () => [
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
    [
      closePerpPosition,
      currentAccount,
      props.perpPosition.asset.denom,
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
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
