'use client'
import { Slide, ToastContainer } from 'react-toastify'

import useStore from 'store'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)

  return (
    <ToastContainer
      autoClose={3000}
      closeButton={false}
      position='bottom-right'
      newestOnTop
      transition={enableAnimations ? Slide : undefined}
    />
  )
}
