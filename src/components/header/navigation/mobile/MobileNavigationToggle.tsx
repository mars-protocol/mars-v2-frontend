import classNames from 'classnames'

import Button from 'components/common/Button'
import useStore from 'store'

interface Props {
  className?: string
}

const barClasses = 'w-4 h-0.5 bg-white transition-all duration-300'
const barClassesAbsolute =
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300'

export default function MobileNavigationToggle(props: Props) {
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
  return (
    <Button
      variant='transparent'
      color='quaternary'
      className={classNames('p-2! w-10 h-10 flex items-center justify-center', props.className)}
      onClick={() => useStore.setState({ mobileNavExpanded: !mobileNavExpanded })}
    >
      {mobileNavExpanded ? (
        <div className='relative w-4 h-4'>
          <div className={classNames(barClasses, barClassesAbsolute, 'rotate-45')} />
          <div className={classNames(barClasses, barClassesAbsolute, '-rotate-45')} />
        </div>
      ) : (
        <div className='flex flex-col gap-[3px] w-4'>
          <div className={barClasses} />
          <div className={barClasses} />
          <div className={barClasses} />
        </div>
      )}
    </Button>
  )
}
