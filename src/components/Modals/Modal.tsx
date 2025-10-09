import classNames from 'classnames'
import { useEffect, useRef } from 'react'

import EscButton from 'components/common/Button/EscButton'
import Card from 'components/common/Card'

export default function Modal(props: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const modalClassName =
    props.modalClassName ??
    'max-w-screen-full md:max-w-modal h-screen-full flex items-center justify-center'

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
        `w-screen-full border-none bg-transparent text-white h-screen-full flex justify-center items-center`,
        'focus-visible:outline-none',
        'max-h-full scrollbar-hide',
        'backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        modalClassName,
      )}
      id={props.dialogId ?? 'modal'}
    >
      <Card
        className={classNames(
          'flex max-w-full h-full flex-1 rounded-sm bg-surface border border-white/20 md:h-auto',
          props.className,
        )}
        contentClassName='overflow-y-scroll scrollbar-hide max-h-screen-full'
      >
        <div className={classNames('flex justify-between relative', props.headerClassName)}>
          {props.header}
          {!props.hideCloseBtn && (
            <EscButton className='!absolute right-2 top-2' onClick={props.onClose} />
          )}
        </div>
        {props.subHeader && <div className='gradient-header'>{props.subHeader}</div>}
        <div className={classNames(props.contentClassName, 'flex-1 relative')}>
          {props.children ?? props.content}
        </div>
      </Card>
    </dialog>
  )
}
