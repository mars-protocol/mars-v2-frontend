import classNames from 'classnames'
import { NavLink, useLocation } from 'react-router-dom'
import { navigateToPage } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  isFarm?: boolean
}

export default function Tab(props: Props) {
  const location = useLocation()

  return (
    <div className='mb-8 w-full'>
      <div className='flex gap-2'>
        <div className='relative'>
          <NavLink
            to={navigateToPage(location.pathname, 'farm')}
            className={classNames(
              !props.isFarm ? 'text-white/20' : underlineClasses,
              'relative mr-8 text-xl',
            )}
          >
            Farm
          </NavLink>
        </div>
        <NavLink
          to={navigateToPage(location.pathname, 'lend')}
          className={classNames(
            props.isFarm ? 'text-white/20' : underlineClasses,
            'relative text-xl',
          )}
        >
          Lend
        </NavLink>
      </div>
    </div>
  )
}
