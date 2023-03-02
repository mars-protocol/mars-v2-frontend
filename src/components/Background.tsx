'use client'

import classNames from 'classnames'

export default function Background() {
  return (
    <div className='background pointer-events-none fixed inset-0 h-full w-full overflow-hidden bg-body'>
      <div
        className={classNames(
          'fixed',
          'h-[20vw] w-[20vw]',
          'min-h-[150px] min-w-[150px]',
          'max-h-[500px] max-w-[500px]',
          'top-[-10vw] left-[-10vw]',
          'bg-orb-primary blur-orb-primary ',
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          'animate-[float_120s_ease_in_out_infinite_2s]',
        )}
      />
      <div
        className={classNames(
          'fixed',
          'h-[40vw] w-[40vw]',
          'min-h-[400px] min-w-[400px]',
          'max-h-[1000px] max-w-[1000px]',
          'bottom-[-10vw] right-[-8vw]',
          'bg-orb-secondary blur-orb-secondary',
          'translate-x-0 translate-y-0  rounded-full opacity-30',
          'animate-[float_150s_bounce_out_infinite_1s]',
        )}
      />
      <div
        className={classNames(
          'fixed',
          'h-[25vw] w-[25vw]',
          'min-h-[120px] min-w-[120px]',
          'max-h-[600px] max-w-[600px]',
          'top-[-10vw] right-[-4vw]',
          'bg-orb-tertiary blur-orb-tertiary ',
          'translate-x-0 translate-y-0 rounded-full opacity-20',
          'animate-[float_180s_ease_in_infinite]',
        )}
      />
    </div>
  )
}
