import classNames from 'classnames'

import Button from 'components/Button'
import { ExclamationMarkCircled } from 'components/Icons'
import Modal from 'components/Modal'
import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'
import Text from 'components/Text'
import useAlertDialog from 'hooks/useAlertDialog'
import useStore from 'store'

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
  const { title, icon, description, negativeButton, positiveButton } = props.config

  const pendingTransaction = useStore((s) => s.pendingTransaction)

  const handleButtonClick = (button?: AlertDialogButton) => {
    button?.onClick && button.onClick()
    props.close()
  }

  async function handleAsyncButtonClick(button?: AlertDialogButton) {
    if (!button?.onClick) return
    useStore.setState({ pendingTransaction: true })
    await button.onClick()
    props.close()
  }

  return (
    <Modal
      onClose={props.close}
      header={
        <div className='grid w-12 h-12 rounded-sm place-items-center bg-white/5'>
          {icon ?? <ExclamationMarkCircled width={18} />}
        </div>
      }
      modalClassName='max-w-modal-sm'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      <Text size='xl'>{title}</Text>
      <Text className='mt-2 text-white/60'>{description}</Text>
      <div
        className={classNames('mt-10 flex justify-between', positiveButton && 'flex-row-reverse')}
      >
        {positiveButton && (
          <Button
            text={positiveButton.text ?? 'Yes'}
            color='tertiary'
            className='px-6'
            rightIcon={positiveButton.icon ?? <YesIcon />}
            showProgressIndicator={pendingTransaction}
            onClick={() =>
              positiveButton.isAsync
                ? handleAsyncButtonClick(positiveButton)
                : handleButtonClick(positiveButton)
            }
          />
        )}
        <Button
          text={negativeButton?.text ?? 'No'}
          color='secondary'
          className='px-6'
          rightIcon={negativeButton?.icon ?? <NoIcon />}
          disabled={pendingTransaction}
          tabIndex={1}
          onClick={() => handleButtonClick(negativeButton)}
        />
      </div>
    </Modal>
  )
}
