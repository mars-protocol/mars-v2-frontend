import classNames from 'classnames'
import { ReactNode } from 'react'

import { Close } from 'components/Icons'
import { Text } from 'components/Text'
import { Button } from 'components/Button'
import Card from 'components/Card'

interface Props {
  header: string | ReactNode
  headerClassName?: string
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  contentClassName?: string
  open: boolean
  setOpen?: (open: boolean) => void
}

export const Modal = (props: Props) => {
  const onClickAway = () => {
    if (props.setOpen) props.setOpen(false)
  }

  return props.open ? (
    <div className='fixed top-0 left-0 z-40 h-screen w-screen'>
      <div className='relative flex h-full w-full items-center justify-center'>
        <Card
          className={classNames(
            'relative z-40 w-[790px] max-w-full bg-white/5 backdrop-blur-3xl',
            props.className,
          )}
        >
          <div className={classNames('flex justify-between', props.headerClassName)}>
            {props.header}
            <Button
              onClick={onClickAway}
              leftIcon={<Close />}
              className='h-8 w-8'
              iconClassName='h-2 w-2'
              color='tertiary'
            />
          </div>
          <div className={props.contentClassName}>
            {props.children ? props.children : props.content}
          </div>
        </Card>
        <div
          className='fixed top-0 left-0 z-30 block h-full w-full bg-black/50 hover:cursor-pointer'
          onClick={onClickAway}
          role='button'
        />
      </div>
    </div>
  ) : null
}
