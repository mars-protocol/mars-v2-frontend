import { useEffect } from 'react'

import { Enter, InfoCircle } from 'components/Icons'
import useAlertDialog from 'hooks/useAlertDialog'

interface Props {
  title: string
  description: string | JSX.Element
  closeHandler: () => void
  positiveButton: AlertDialogButton
}

export default function AccoundDeleteAlertDialog(props: Props) {
  const { open: showAlertDialog } = useAlertDialog()
  const { title, description, closeHandler, positiveButton } = props

  useEffect(() => {
    showAlertDialog({
      icon: (
        <div className='flex h-full w-full p-3'>
          <InfoCircle />
        </div>
      ),
      title,
      description,
      negativeButton: {
        text: 'Cancel',
        icon: <Enter />,
        onClick: closeHandler,
      },
      positiveButton,
    })
  }, [showAlertDialog, title, description, closeHandler, positiveButton])

  return null
}
