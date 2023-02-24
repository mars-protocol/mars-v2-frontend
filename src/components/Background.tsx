'use client'

import classNames from 'classnames'

export default function Background() {
  const backgroundClasses = classNames(
    'top-0 left-0 absolute block h-full w-full flex-col bg-body bg-desktop bg-top bg-no-repeat filter bg-[#06040C]',
  )

  return <div className={backgroundClasses} />
}
