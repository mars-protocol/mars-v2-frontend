import classNames from 'classnames'

import Button from 'components/common/Button'
import useStore from 'store'

interface Props {
  className?: string
}

const barClasses = 'w-4 h-0.5 bg-white my-[1px] transition-all duration-500'

export default function MobileNavigationToggle(props: Props) {
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
  return (
    <Button
      variant='solid'
      color='secondary'
      className={classNames(
        '!px-2 w-10 flex-wrap active:bg-transparent focus:bg-transparent',
        props.className,
      )}
      onClick={() => useStore.setState({ mobileNavExpanded: !mobileNavExpanded })}
    >
      <div
        className={classNames(
          barClasses,
          mobileNavExpanded
            ? '-rotate-45 -translate-x-0 translate-y-1.5'
            : 'rotate-0 translate-x-0 translate-y-0',
        )}
      />
      <div className={classNames(barClasses, mobileNavExpanded ? 'opacity-0' : 'opacity-100')} />
      <div
        className={classNames(
          barClasses,
          mobileNavExpanded
            ? 'rotate-45 translate-x-0 -translate-y-1.5'
            : 'rotate-0 translate-x-0 translate-y-0',
        )}
      />
    </Button>
  )
}
