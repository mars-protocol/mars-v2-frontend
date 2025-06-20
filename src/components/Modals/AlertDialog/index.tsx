import classNames from 'classnames'

import Button from 'components/common/Button'
import Checkbox from 'components/common/Checkbox'
import EscButton from 'components/common/Button/EscButton'
import Text from 'components/common/Text'
import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'
import Modal from 'components/Modals/Modal'
import useAlertDialog from 'hooks/common/useAlertDialog'
import useToggle from 'hooks/common/useToggle'

export default function AlertDialogController() {
  const { config, close } = useAlertDialog()

  if (!config) return null

  return <AlertDialog config={config} close={close} />
}

interface Props {
  config: AlertDialogConfig
  close: () => void
}

function AlertDialog(props: Props) {
  const {
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
  } = props.config

  const [toggle, handleToggle] = useToggle()

  const handleButtonClick = (button?: AlertDialogButton) => {
    button?.onClick && button.onClick()
    props.close()
  }

  function handleCheckboxClick() {
    handleToggle()
    checkbox?.onClick(!toggle)
  }

  return (
    <Modal
      onClose={props.close}
      hideTxLoader
      header={
        header ? (
          <div className='flex items-center justify-between w-full'>
            {header}
            {showCloseButton && <EscButton onClick={props.close} />}
          </div>
        ) : (
          <div className='flex items-center gap-4'>
            {icon && <div className='w-10 h-10'>{icon}</div>}
            <Text size='2xl' className={titleClassName}>
              {title ?? ''}
            </Text>
          </div>
        )
      }
      className={classNames('md:h-auto h-screen-full', modalClassName)}
      modalClassName='max-w-screen-full md:max-w-modal-md h-screen-full flex items-center justify-center'
      headerClassName='p-4 md:p-6'
      contentClassName='md:px-6 md:pb-6 p-4'
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
                name='hls-info-toggle'
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
                color='tertiary'
                className='px-6'
                rightIcon={positiveButton.icon ?? <YesIcon />}
                iconClassName='h-4 w-5'
                onClick={() => handleButtonClick(positiveButton)}
                disabled={positiveButton.disabled}
              />
            )}
            {checkbox && (
              <Checkbox
                name='hls-info-toggle'
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
