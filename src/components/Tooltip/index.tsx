import Tippy, { TippyProps } from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { Questionmark } from 'components/Icons'
import TooltipContent from 'components/Tooltip/TooltipContent'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'

interface Props extends TippyProps {
  content: ReactNode | string
  type: TooltipType
  className?: string
  delay?: number
  interactive?: boolean
  underline?: boolean
  hideArrow?: boolean
  contentClassName?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip = (props: Props) => {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )

  const isInWalletAssetModal = document.getElementById('wallet-assets-modal')
  const isInModal = document.getElementById('modal')

  return (
    <Tippy
      appendTo={() => isInWalletAssetModal ?? isInModal ?? document.body}
      interactive={props.interactive}
      animation={false}
      delay={[props.delay ?? 0, 0]}
      placement={props.placement ?? 'top'}
      render={() => (
        <TooltipContent
          hideArrow={props.hideArrow}
          type={props.type}
          content={props.content}
          className={props.contentClassName}
        />
      )}
      onClickOutside={props.onClickOutside}
      visible={props.visible}
    >
      {props.children ? (
        <span
          className={classNames(
            props.underline &&
              'border-b-1 hover:cursor-pointer border border-x-0 border-t-0 border-dashed border-white/20 pb-1',
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
