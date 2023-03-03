import classNames from 'classnames'
import { ReactNode } from 'react'

import { Close } from 'components/Icons'
import { Text } from 'components/Text'

import { Button } from './Button'

interface Props {
  title: string
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  open: boolean
  setOpen?: (open: boolean) => void
}

export const Modal = (props: Props) => {
  const onClickAway = () => {
    if (props.setOpen) props.setOpen(false)
  }

  return props.open ? (
    <div className='fixed top-0 left-0 z-20 h-screen w-screen'>
      <div className='relative flex h-full w-full items-center justify-center'>
        <section
          className={classNames(
            'relative z-40 w-[790px] max-w-full rounded-md border border-white/20 bg-white/5 p-6 backdrop-blur-3xl',
            props.className,
          )}
        >
          <div className='flex justify-between pb-6'>
            <Text>{props.title}</Text>
            <Button
              onClick={onClickAway}
              icon={<Close />}
              iconClassName='h-2 w-2'
              color='tertiary'
            />
          </div>
          <div>{props.children ? props.children : props.content}</div>
        </section>
        <div
          className='fixed top-0 left-0 z-30 block h-full w-full bg-black/50 hover:cursor-pointer'
          onClick={onClickAway}
          role='button'
        />
      </div>
    </div>
  ) : null
}
