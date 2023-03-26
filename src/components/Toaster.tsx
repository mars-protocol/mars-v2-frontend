'use client'
import { useRouter } from 'next/navigation'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'
import classNames from 'classnames'

import { CheckCircled, Cross, CrossCircled } from 'components/Icons'
import { Text } from 'components/Text'
import useStore from 'store'

import { Button } from './Button'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const toast = useStore((s) => s.toast)
  const router = useRouter()

  if (toast) {
    const Msg = () => (
      <div
        className={classNames(
          'relative z-1 m-0 flex w-full flex-wrap rounded-sm p-6 shadow-overlay backdrop-blur-lg',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
          toast.isError ? 'bg-error-bg/20' : 'bg-success-bg/20',
        )}
      >
        <div className='mb-4 flex w-full gap-2'>
          <div
            className={classNames('rounded-sm p-1.5', toast.isError ? 'bg-error' : 'bg-success')}
          >
            <span className='block h-4 w-4 text-white'>
              {toast.isError ? <CrossCircled /> : <CheckCircled />}
            </span>
          </div>
          <Text
            size='base'
            className={classNames(
              'flex items-center font-bold',
              toast.isError ? 'text-error' : 'text-success',
            )}
          >
            {toast.isError ? 'Error' : 'Success'}
          </Text>
        </div>

        <Text size='sm' className='text-bold text-white'>
          {toast.message}
        </Text>
        <div className='absolute top-8 right-6 '>
          <Button
            leftIcon={<Cross />}
            variant='transparent'
            className='w-2'
            iconClassName={classNames('w-2 h-2', toast.isError ? 'text-error' : 'text-success')}
          />
        </div>
      </div>
    )

    createToast(Msg, {
      icon: false,
      draggable: false,
      closeOnClick: true,
      progressClassName: classNames('h-[1px] bg-none', toast.isError ? 'bg-error' : 'bg-success'),
    })

    useStore.setState({ toast: null })
    router.refresh()
  }

  return (
    <ToastContainer
      autoClose={5000}
      closeButton={false}
      position='top-right'
      newestOnTop
      transition={enableAnimations ? Slide : undefined}
      className='p-0'
      toastClassName='top-[73px] z-50 m-0 mb-4 flex w-full bg-transparent p-0'
      bodyClassName='p-0 m-0 w-full flex'
    />
  )
}
