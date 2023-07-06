import classNames from 'classnames'
import { ReactNode, useEffect, useRef } from 'react'

import EscButton from 'components/Button/EscButton'
import Card from 'components/Card'

interface Props {
  header: string | ReactNode
  headerClassName?: string
  hideCloseBtn?: boolean
  children?: ReactNode | string
  content?: ReactNode | string
  className?: string
  contentClassName?: string
  modalClassName?: string
  onClose: () => void
}

export default function Modal(props: Props) {
  const ref: any = useRef(null)
  const modalClassName = props.modalClassName ?? 'max-w-modal'

  function onClose() {
    ref.current?.close()
    props.onClose()
  }

  useEffect(() => {
    ref.current?.showModal()
    document.body.classList.add('h-screen', 'overflow-hidden')
  }, [])

  // close dialog on unmount
  useEffect(() => {
    const dialog = ref.current
    return () => {
      dialog.removeAttribute('open')
      dialog.close()
      document.body.classList.remove('h-screen', 'overflow-hidden')
    }
  }, [])

  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className={classNames(
        `w-screen border-none bg-transparent text-white`,
        'focus-visible:outline-none',
        'max-h-full scrollbar-hide',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        modalClassName,
      )}
    >
      <Card
        className={classNames(
          'relative flex max-w-full flex-1 bg-white/5 backdrop-blur-3xl',
          props.className,
        )}
      >
        <div className={classNames('flex justify-between', props.headerClassName)}>
          {props.header}
          {!props.hideCloseBtn && <EscButton onClick={props.onClose} />}
        </div>
        <div className={classNames(props.contentClassName, 'flex-1 overflow-y-scroll')}>
          {props.children ? props.children : props.content}
        </div>
      </Card>
    </dialog>
  )
}
