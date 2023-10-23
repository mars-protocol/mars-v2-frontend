import { useEffect } from 'react'

import { Enter, InfoCircle } from 'components/Icons'
import useAlertDialog from 'hooks/useAlertDialog'

interface Props {
  content: string | JSX.Element
  title: string
  icon?: JSX.Element
  closeHandler: () => void
  positiveButton: AlertDialogButton
}

export default function AccountDeleteAlertDialog(props: Props) {
  const { open: showAlertDialog } = useAlertDialog()
  const { title, content, closeHandler, positiveButton } = props

  useEffect(() => {
    showAlertDialog({
      icon: <InfoCircle />,
      title,
      content,
      negativeButton: {
        text: 'Cancel',
        icon: <Enter />,
        onClick: closeHandler,
      },
      positiveButton,
    })
  }, [showAlertDialog, closeHandler, positiveButton, title, content])

  return null
}
