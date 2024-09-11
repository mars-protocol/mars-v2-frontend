import { useCallback } from 'react'

import useStore from '../../store'

function useAlertDialog() {
  const config = useStore((s) => s.alertDialog)

  const open = useCallback((config: AlertDialogConfig) => {
    useStore.setState({ alertDialog: config })
  }, [])

  const close = useCallback(() => {
    useStore.setState({ alertDialog: null })
  }, [])

  return { config, open, close }
}

export default useAlertDialog
