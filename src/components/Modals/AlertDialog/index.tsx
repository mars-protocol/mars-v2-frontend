import classNames from 'classnames'

import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import Modal from 'components/Modal'
import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'
import Text from 'components/Text'
import useAlertDialog from 'hooks/useAlertDialog'
import useToggle from 'hooks/useToggle'

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
  const { title, icon, content, negativeButton, positiveButton, checkbox } = props.config

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
        <div className='flex flex-col'>
          {icon && (
            <div className='grid w-12 h-12 mb-4 rounded-sm place-items-center bg-white/5'>
              {icon}
            </div>
          )}
          <Text size='2xl'>{title}</Text>
        </div>
      }
      modalClassName='max-w-modal-sm'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      {typeof content === 'string' ? (
        <Text className='mt-2 text-white/60'>{content}</Text>
      ) : (
        content
      )}
      <div
        className={classNames('mt-10 flex justify-between', positiveButton && 'flex-row-reverse')}
      >
        <div className='flex flex-row-reverse gap-4'>
          {positiveButton && (
            <Button
              text={positiveButton.text ?? 'Yes'}
              color='tertiary'
              className='px-6'
              rightIcon={positiveButton.icon ?? <YesIcon />}
              onClick={() => handleButtonClick(positiveButton)}
            />
          )}
          {checkbox && (
            <Checkbox
              name='aleart-toggle'
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
    </Modal>
  )
}
