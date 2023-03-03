'use client'
import { useRouter } from 'next/navigation'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'

import useStore from 'store'
import { Check, Warning } from 'components/Icons'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const toast = useStore((s) => s.toast)
  const router = useRouter()

  if (toast) {
    if (toast.isError) {
      createToast.error(toast.message, {
        progressClassName: 'bg-loss',
        icon: (
          <span className='h-4 w-4'>
            <Warning />
          </span>
        ),
      })
    } else {
      createToast.success(toast.message, {
        progressClassName: 'bg-profit',
        icon: (
          <span className='h-4 w-4'>
            <Check />
          </span>
        ),
      })
    }
    useStore.setState({ toast: null })
    router.refresh()
  }

  return (
    <ToastContainer
      autoClose={5000}
      closeButton={false}
      position='bottom-right'
      newestOnTop
      transition={enableAnimations ? Slide : undefined}
      className='w-[280px] p-0'
      toastClassName='z-50 text-xs rounded-sm border border-white/40 shadow-overlay backdrop-blur-sm gradient-popover px-2 py-4'
      bodyClassName='p-0 text-white m-0'
    />
  )
}
