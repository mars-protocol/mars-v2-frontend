import classNames from 'classnames'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { mutate } from 'swr'

import { Button } from 'components/Button'
import { CheckCircled, Cross, CrossCircled } from 'components/Icons'
import Text from 'components/Text'
import useStore from 'store'

export default function Toaster() {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const toast = useStore((s) => s.toast)

  if (toast) {
    const Msg = () => (
      <div
        className={classNames(
          'relative isolate m-0 flex w-full flex-wrap rounded-sm p-6 shadow-overlay backdrop-blur-lg',
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
            className={classNames(
              'flex items-center font-bold',
              toast.isError ? 'text-error' : 'text-success',
            )}
          >
            {toast.isError ? 'Error' : 'Success'}
          </Text>
        </div>

        <Text size='sm' className='font-bold text-white'>
          {toast.message}
        </Text>
        <div className='absolute right-6 top-8 '>
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
    mutate(() => true)
  }

  return (
    <ToastContainer
      autoClose={5000}
      closeButton={false}
      position='top-right'
      newestOnTop
      closeOnClick
      transition={enableAnimations ? Slide : undefined}
      className='p-0'
      toastClassName='top-[73px] z-20 m-0 mb-4 flex w-full bg-transparent p-0'
      bodyClassName='p-0 m-0 w-full flex'
    />
  )
}
