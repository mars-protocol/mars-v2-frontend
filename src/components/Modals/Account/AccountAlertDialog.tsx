import { ReactElement, useEffect, useMemo } from 'react'

import { Enter, InfoCircle } from 'components/common/Icons'
import useAlertDialog from 'hooks/common/useAlertDialog'

interface Props {
  content: string | ReactElement
  title: string
  icon?: ReactElement
  closeHandler: () => void
  positiveButton: AlertDialogButton
}

export default function AccountAlertDialog(props: Props) {
  const { open: showAlertDialog, close: closeAlertDialog } = useAlertDialog()
  const { title, content, closeHandler, positiveButton, icon = <InfoCircle /> } = props

  const alertConfig = useMemo(
    () => ({
      icon,
      title,
      content,
      negativeButton: {
        text: 'Cancel',
        icon: <Enter />,
        onClick: () => {
          closeHandler()
          closeAlertDialog()
        },
      },
      positiveButton: {
        ...positiveButton,
        onClick: async () => {
          if (positiveButton.onClick) {
            await positiveButton.onClick()
          }
          closeAlertDialog()
        },
      },
      onEscapeKeyDown: () => {
        closeHandler()
        closeAlertDialog()
      },
    }),
    [title, content, closeHandler, positiveButton, icon, closeAlertDialog],
  )

  useEffect(() => {
    showAlertDialog(alertConfig)

    return () => {
      closeAlertDialog()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAlertDialog, closeAlertDialog])

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeHandler()
        closeAlertDialog()
      }
    }

    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [closeHandler, closeAlertDialog])

  return null
}
