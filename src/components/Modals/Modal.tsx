import classNames from 'classnames'
import { ReactNode, useEffect, useRef } from 'react'

import EscButton from 'components/common/Button/EscButton'
import Card from 'components/common/Card'

export interface ModalProps {
  header: string | ReactNode
  headerClassName?: string
  hideCloseBtn?: boolean
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  contentClassName?: string
  modalClassName?: string
  onClose: () => void
  hideTxLoader?: boolean
  dialogId?: string
}

export default function Modal(props: ModalProps) {
  const ref: React.RefObject<HTMLDialogElement> = useRef(null)
  const modalClassName = props.modalClassName ?? 'max-w-screen-full md:max-w-modal h-screen-full'

  function onClose() {
    ref.current?.close()
    props.onClose()
  }

  useEffect(() => {
    ref.current?.showModal()
    document.body.classList.add('h-screen-full', 'overflow-hidden')
  }, [])

  // close dialog on unmount
  useEffect(() => {
    const dialog = ref.current
    return () => {
      dialog?.removeAttribute('open')
      dialog?.close()
      document.body.classList.remove('h-screen-full', 'overflow-hidden')
    }
  }, [])

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className={classNames(
        `w-screen-full border-none bg-transparent text-white`,
        'focus-visible:outline-none',
        'max-h-full scrollbar-hide',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        modalClassName,
      )}
      id={props.dialogId ? props.dialogId : 'modal'}
    >
      <Card
        className={classNames(
          'flex max-w-full flex-1 bg-white/5 backdrop-blur-3xl md:overflow-hidden overflow-y-scroll',
          props.className,
        )}
      >
        <div className={classNames('flex justify-between', props.headerClassName)}>
          {props.header}
          {!props.hideCloseBtn && <EscButton onClick={props.onClose} />}
        </div>
        <div
          className={classNames(
            props.contentClassName,
            'flex-1 overflow-y-scroll scrollbar-hide relative',
          )}
        >
          {props.children ? props.children : props.content}
        </div>
      </Card>
    </dialog>
  )
}
