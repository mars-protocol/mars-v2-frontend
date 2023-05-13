import classNames from 'classnames'
import { useParams, NavLink } from 'react-router-dom'

import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  isFarm?: boolean
}

export default function Tab(props: Props) {
  const params = useParams()

  return (
    <div className='mb-8 w-full'>
      <div className='flex gap-2'>
        <div className='relative'>
          <NavLink
            to={getRoute(
              {
                accountId: params.accountId || '',
                address: params.addres || '',
                page: params.page || '',
              },
              { page: 'farm' },
            )}
            className={classNames(
              !props.isFarm ? 'text-white/20' : underlineClasses,
              'relative mr-8 text-xl',
            )}
          >
            Farm
          </NavLink>
        </div>
        <NavLink
          to={getRoute(
            {
              accountId: params.accountId || '',
              address: params.addres || '',
              page: params.page || '',
            },
            { page: 'lend' },
          )}
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
