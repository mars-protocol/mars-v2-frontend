import Button from 'components/Button'
import { ExclamationMarkCircled } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import useAlertDialog from 'hooks/useAlertDialog'
import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'

function AlertDialogController() {
  const { config, close } = useAlertDialog()

  if (!config) return null

  return <AlertDialog config={config} close={close} />
}

interface Props {
  config: AlertDialogConfig
  close: () => void
}

function AlertDialog(props: Props) {
  const { title, icon, description, negativeButton, positiveButton } = props.config

  const handleButtonClick = (button?: AlertDialogButton) => {
    button?.onClick && button.onClick()
    props.close()
  }

  return (
    <Modal
      open
      onClose={props.close}
      header={
        <div className='grid h-12 w-12 place-items-center rounded-sm bg-white/5'>
          {icon ?? <ExclamationMarkCircled width={18} />}
        </div>
      }
      modalClassName='w-[577px]'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      <Text size='xl'>{title}</Text>
      <Text className='mt-2 text-white/60'>{description}</Text>
      <div className='mt-10 flex flex-row-reverse justify-between'>
        <Button
          text={positiveButton.text ?? 'Yes'}
          color='tertiary'
          className='px-6'
          rightIcon={positiveButton.icon ?? <YesIcon />}
          onClick={() => handleButtonClick(positiveButton)}
        />
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

export default AlertDialogController
