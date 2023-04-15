import classNames from 'classnames'
import Link from 'next/link'

import { getRoute } from 'utils/route'

const underlineClasses =
  'relative before:absolute before:h-[2px] before:-bottom-1 before:left-0 before:right-0 before:gradient-active-tab'

interface Props {
  params: PageParams
  isFarm?: boolean
}

export default function Tab(props: Props) {
  return (
    <div className='mb-8 w-full'>
      <div className='flex gap-2'>
        <div className='relative'>
          <Link
            href={getRoute(props.params, { page: 'earn/farm' })}
            className={classNames(
              !props.isFarm ? 'text-white/20' : underlineClasses,
              'relative mr-8 text-xl',
            )}
          >
            Farm
          </Link>
        </div>
        <Link
          href={getRoute(props.params, { page: 'earn/lend' })}
          className={classNames(
            props.isFarm ? 'text-white/20' : underlineClasses,
            'relative text-xl',
          )}
        >
          Lend
        </Link>
      </div>
    </div>
  )
}
