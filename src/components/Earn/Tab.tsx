import classNames from 'classnames'
import { NavLink, useParams } from 'react-router-dom'

import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  isFarm?: boolean
}

export default function Tab(props: Props) {
  const { address, accountId } = useParams()

  return (
    <div className='relative w-full mb-4'>
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
