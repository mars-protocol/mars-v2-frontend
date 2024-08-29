import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import DropDownButton from 'components/common/Button/DropDownButton'
import { Cross, Edit } from 'components/common/Icons'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { SearchParams } from 'types/enums'
import { getSearchParamsObject } from 'utils/route'

export const MANAGE_META = { id: 'manage', header: 'Manage' }

interface Props {
  perpPosition: PerpPositionRow
}

export default function Manage(props: Props) {
  const currentAccount = useCurrentAccount()
  const [searchParams, setSearchParams] = useSearchParams()

  const executePerpOrder = useStore((s) => s.executePerpOrder)
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
          await executePerpOrder({
            accountId: currentAccount.id,
            coin: BNCoin.fromDenomAndBigNumber(
              props.perpPosition.asset.denom,
              props.perpPosition.amount.negated(),
            ),
          })
        },
      },
    ],
    [
      currentAccount,
      executePerpOrder,
      props.perpPosition.amount,
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
