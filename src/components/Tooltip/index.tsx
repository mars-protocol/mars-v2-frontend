import Tippy from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { Questionmark } from 'components/Icons'
import TooltipContent from 'components/Tooltip/TooltipContent'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

interface Props {
  content: ReactNode | string
  type: TooltipType
  children?: ReactNode | string
  className?: string
  delay?: number
  interactive?: boolean
  underline?: boolean
}

export const Tooltip = (props: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)

  const isInWalletAssetModal = document.getElementById('wallet-assets-modal')
  const isInModal = document.getElementById('modal')

  return (
    <Tippy
      appendTo={() => isInWalletAssetModal ?? isInModal ?? document.body}
      interactive={props.interactive}
      animation={false}
      delay={[props.delay ?? 0, 0]}
      render={() => <TooltipContent type={props.type} content={props.content} />}
    >
      {props.children ? (
        <span
          className={classNames(
            props.underline &&
              'border-b-1 hover:cursor-pointer border border-x-0 border-t-0 border-dashed border-white/50 hover:border-transparent',
            !reduceMotion && 'transition-all',
            props.className,
          )}
        >
          {props.children}
        </span>
      ) : (
        <span
          className={classNames(
            'inline-block w-[18px] hover:cursor-pointer opacity-40 hover:opacity-80',
            props.className,
          )}
        >
          <Questionmark />
        </span>
      )}
    </Tippy>
  )
}
