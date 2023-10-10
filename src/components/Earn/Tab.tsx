import classNames from 'classnames'
import { NavLink, useParams } from 'react-router-dom'

import useAccountId from 'hooks/useAccountId'
import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  isFarm?: boolean
}

export default function Tab(props: Props) {
  const accountId = useAccountId()
  const { address } = useParams()

  return (
    <div className='relative w-full'>
      <NavLink
        to={getRoute('lend', address, accountId)}
        className={classNames(
          props.isFarm ? 'text-white/40' : underlineClasses,
          'relative mr-8 text-xl ',
        )}
      >
        Lend
      </NavLink>
      <NavLink
        to={getRoute('farm', address, accountId)}
        className={classNames(
          !props.isFarm ? 'text-white/40' : underlineClasses,
          'relative text-xl',
        )}
      >
        Farm
      </NavLink>
    </div>
  )
}
