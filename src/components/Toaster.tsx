'use client'
import { ToastContainer, Zoom } from 'react-toastify'

import useStore from 'store'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)

  return (
    <ToastContainer
      autoClose={1500}
      closeButton={false}
      position='bottom-right'
      hideProgressBar
      newestOnTop
      transition={enableAnimations ? Zoom : undefined}
    />
  )
}
