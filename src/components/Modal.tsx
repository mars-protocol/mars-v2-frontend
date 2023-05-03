'use client'

import classNames from 'classnames'
import { ReactNode, useEffect, useRef } from 'react'

import { Button } from 'components/Button'
import Card from 'components/Card'
import { Cross } from 'components/Icons'

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
  const modalRef: any = useRef(null)
  const preventAutoClose = (e: React.MouseEvent) => e.stopPropagation()

  function onClose() {
    modalRef.current?.close()
  }

  useEffect(() => {
    if (props.open) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [props.open])

  return (
    <dialog
      ref={modalRef}
      onCancel={onClose}
      onClick={onClose}
      className={classNames(
        'w-[895px] border-none',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm backdrop:hover:cursor-pointer',
      )}
    >
      <Card
        className={classNames(
          'relative w-full max-w-full bg-white/5 backdrop-blur-3xl',
          props.className,
        )}
        onClick={preventAutoClose}
      >
        <div className={classNames('flex justify-between', props.headerClassName)}>
          {props.header}
          <Button
            onClick={onClose}
            leftIcon={<Cross />}
            className='w-8 h-8'
            iconClassName='h-2 w-2'
            color='tertiary'
          />
        </div>
        <div className={classNames(props.contentClassName, 'flex-grow')}>
          {props.children ? props.children : props.content}
        </div>
      </Card>
    </dialog>
  )
}
