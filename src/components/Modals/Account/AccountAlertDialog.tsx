import { ReactElement, useCallback, useEffect, useState } from 'react'

import AlertDialog from 'components/common/AlertDialog'
import { Enter, InfoCircle } from 'components/common/Icons'

interface Props {
  content: string | ReactElement
  title: string
  icon?: ReactElement
  closeHandler: () => void
  positiveButton: AlertDialogButton
}

export default function AccountAlertDialog(props: Props) {
  const { title, content, closeHandler, positiveButton, icon = <InfoCircle /> } = props
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    closeHandler()
  }, [closeHandler])

  const handlePositiveClick = async () => {
    if (positiveButton.onClick) {
      await positiveButton.onClick()
    }
    setIsOpen(false)
  }

  useEffect(() => {
    setIsOpen(true)
  }, [])

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [handleClose])

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      content={content}
      icon={icon}
      positiveButton={{
        ...positiveButton,
        onClick: handlePositiveClick,
      }}
      negativeButton={{
        text: 'Cancel',
        icon: <Enter />,
        onClick: handleClose,
      }}
    />
  )
}
