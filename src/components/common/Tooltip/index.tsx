import Tippy, { TippyProps } from '@tippyjs/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

import { Questionmark } from 'components/common/Icons'
import TooltipContent from 'components/common/Tooltip/TooltipContent'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
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
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )

  const isInWalletAssetModal = document.getElementById('wallet-assets-modal')
  const isInModal = document.getElementById('modal')
  const isInMarsStakingModal = document.getElementById('mars-staking-modal')

  return (
    <Tippy
      appendTo={() => isInWalletAssetModal ?? isInMarsStakingModal ?? isInModal ?? document.body}
      zIndex={isInWalletAssetModal || isInMarsStakingModal || isInModal ? 9999 : undefined}
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
        <div
          className={classNames(
            props.underline &&
              'border-b hover:cursor-help border-dashed border-white/40 hover:border-transparent',
            !reduceMotion && 'transition-all duration-200',
            props.className,
          )}
        >
          {props.children}
        </div>
      ) : (
        <div
          className={classNames(
            'inline-block w-[18px] hover:cursor-help opacity-40 hover:opacity-80',
            props.className,
          )}
        >
          <Questionmark />
        </div>
      )}
    </Tippy>
  )
}
