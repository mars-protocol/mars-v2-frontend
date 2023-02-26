'use client'
import { useRouter } from 'next/navigation'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'

import useStore from 'store'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const toast = useStore((s) => s.toast)
  const router = useRouter()

  if (toast) {
    if (toast.isError) {
      createToast.error(toast.message)
    } else {
      createToast.success(toast.message)
    }
    useStore.setState({ toast: null })
    router.refresh()
  }

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
