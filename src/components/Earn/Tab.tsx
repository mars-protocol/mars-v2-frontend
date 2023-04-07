import classNames from 'classnames'
import Link from 'next/link'
import { getRoute } from 'utils/route'

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
            className={classNames(!props.isFarm && 'text-white/20', 'relative mr-8 text-xl')}
          >
            Farm
            {props.isFarm && <UnderLine />}
          </Link>
        </div>
        <Link
          href={getRoute(props.params, { page: 'earn/lend' })}
          className={classNames(props.isFarm && 'text-white/20', 'relative text-xl')}
        >
          Lend
          {!props.isFarm && <UnderLine />}
        </Link>
      </div>
    </div>
  )
}

function UnderLine() {
  return <div className='absolute -bottom-2 left-0 right-0 h-[2px] gradient-active-tab' />
}
