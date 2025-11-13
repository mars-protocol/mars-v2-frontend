import classNames from 'classnames'

import Button from 'components/common/Button'
import EscButton from 'components/common/Button/EscButton'
import Checkbox from 'components/common/Checkbox'
import Text from 'components/common/Text'
import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'
import Modal from 'components/Modals/Modal'
import useToggle from 'hooks/common/useToggle'

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  content: React.ReactElement | string
  icon?: React.ReactElement
  header?: React.ReactElement
  positiveButton?: AlertDialogButton
  negativeButton?: AlertDialogButton
  checkbox?: {
    text: string
    onClick: (isChecked: boolean) => void
  }
  isSingleButtonLayout?: boolean
  showCloseButton?: boolean
  titleClassName?: string
  modalClassName?: string
}

export default function AlertDialog(props: AlertDialogProps) {
  const {
    isOpen,
    onClose,
    title,
    icon,
    content,
    negativeButton,
    positiveButton,
    checkbox,
    header,
    isSingleButtonLayout,
    showCloseButton,
    titleClassName,
    modalClassName,
  } = props

  const [toggle, handleToggle] = useToggle()

  if (!isOpen) return null

  const handleButtonClick = (button?: AlertDialogButton) => {
    button?.onClick && button.onClick()
    onClose()
  }

  function handleCheckboxClick() {
    handleToggle()
    checkbox?.onClick(!toggle)
  }

  return (
    <Modal
      onClose={onClose}
      hideTxLoader
      header={
        header ? (
          <div className='flex items-center justify-between w-full'>
            {header}
            {showCloseButton && <EscButton onClick={onClose} />}
          </div>
        ) : (
          <div className='flex items-center gap-4'>
            {icon && (
              <div className='flex shrink-0 items-center justify-center h-10 w-10'>{icon}</div>
            )}
            <Text size='2xl' className={titleClassName}>
              {title ?? ''}
            </Text>
          </div>
        )
      }
      className={classNames('md:h-auto h-screen-full', modalClassName)}
      headerClassName='p-4 md:p-6'
      contentClassName='md:px-6 md:pb-6 p-4 text-left'
      hideCloseBtn
    >
      {typeof content === 'string' ? (
        <Text className='mt-2 text-white/60'>{content}</Text>
      ) : (
        content
      )}
      {isSingleButtonLayout ? (
        <div className='mt-10 flex flex-col gap-4'>
          {checkbox && (
            <div className='flex justify-center'>
              <Checkbox
                name='alert-dialog-checkbox'
                checked={toggle}
                onChange={handleCheckboxClick}
                text={checkbox.text}
              />
            </div>
          )}
          {positiveButton && (
            <Button
              text={positiveButton.text ?? 'Continue'}
              color='primary'
              className='w-full'
              rightIcon={positiveButton.icon}
              onClick={() => handleButtonClick(positiveButton)}
              disabled={positiveButton.disabled}
            />
          )}
        </div>
      ) : (
        <div
          className={classNames(
            'mt-10 flex justify-between gap-4 md:flex-nowrap flex-wrap',
            positiveButton && 'flex-row-reverse',
          )}
        >
          <div className='flex flex-row-reverse gap-4'>
            {positiveButton && (
              <Button
                text={positiveButton.text ?? 'Yes'}
                color='secondary'
                className='px-6'
                rightIcon={positiveButton.icon ?? <YesIcon />}
                iconClassName='h-4 w-5'
                onClick={() => handleButtonClick(positiveButton)}
                disabled={positiveButton.disabled}
              />
            )}
            {checkbox && (
              <Checkbox
                name='alert-dialog-checkbox'
                checked={toggle}
                onChange={handleCheckboxClick}
                text={checkbox.text}
              />
            )}
          </div>
          <Button
            text={negativeButton?.text ?? 'No'}
            color='secondary'
            className='px-6'
            rightIcon={negativeButton?.icon ?? <NoIcon />}
            tabIndex={1}
            onClick={() => handleButtonClick(negativeButton)}
          />
        </div>
      )}
    </Modal>
  )
}
