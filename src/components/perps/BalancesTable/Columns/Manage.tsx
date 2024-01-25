import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import DropDownButton from 'components/common/Button/DropDownButton'
import { Cross, Edit } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'
import { SearchParams } from 'types/enums/searchParams'
import { getSearchParamsObject } from 'utils/route'

export const MANAGE_META = { id: 'manage', header: 'Manage' }

interface Props {
  perpPosition: PerpPositionRow
}

export default function Manage(props: Props) {
  const currentAccount = useCurrentAccount()
  const [searchParams, setSearchParams] = useSearchParams()

  const closePerpPosition = useStore((s) => s.closePerpPosition)
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
            [SearchParams.PERPS_MANAGE]: 'true',
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

  return (
    <div className='flex justify-end'>
      <DropDownButton items={ITEMS} text='Manage' color='tertiary' />
    </div>
  )
}
