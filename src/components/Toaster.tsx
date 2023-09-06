import classNames from 'classnames'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'
import { mutate } from 'swr'

import { CheckCircled, Cross, CrossCircled, ExternalLink } from 'components/Icons'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { EXPLORER_NAME, EXPLORER_TX_URL } from 'constants/explorer'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

import { TextLink } from './TextLink'

export default function Toaster() {
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)
  const toast = useStore((s) => s.toast)
  const isError = toast?.isError

  if (toast) {
    const Msg = () => (
      <div
        className={classNames(
          'relative isolate m-0 flex w-full flex-wrap rounded-sm p-6 shadow-overlay backdrop-blur-lg',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
          isError ? 'bg-error-bg/20' : 'bg-success-bg/20',
        )}
      >
        <div className='flex w-full gap-2 mb-4'>
          <div className={classNames('rounded-sm p-1.5', isError ? 'bg-error' : 'bg-success')}>
            <span className='block w-4 h-4 text-white'>
              {isError ? <CrossCircled /> : <CheckCircled />}
            </span>
          </div>
          <Text
            className={classNames(
              'flex items-center font-bold',
              isError ? 'text-error' : 'text-success',
            )}
          >
            {toast.title ? toast.title : isError ? 'Error' : 'Success'}
          </Text>
        </div>

        <Text size='sm' className='font-bold text-white'>
          {toast.message}
        </Text>
        {toast.hash && (
          <TextLink
            href={`${EXPLORER_TX_URL}${toast.hash}`}
            target='_blank'
            className={classNames(
              'leading-4 underline mt-4 hover:no-underline hover:text-white',
              isError ? 'text-error' : 'text-success',
            )}
            title={`View on ${EXPLORER_NAME}`}
          >
            {`View on ${EXPLORER_NAME}`}
            <ExternalLink className='-mt-0.5 ml-2 inline w-3.5' />
          </TextLink>
        )}
        <div className='absolute right-6 top-8 '>
          <Cross className={classNames('h-2 w-2', isError ? 'text-error' : 'text-success')} />
        </div>
      </div>
    )

    createToast(Msg, {
      icon: false,
      draggable: false,
      closeOnClick: true,
      progressClassName: classNames('h-[1px] bg-none', isError ? 'bg-error' : 'bg-success'),
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
      transition={reduceMotion ? undefined : Slide}
      className='p-0'
      toastClassName='top-[73px] z-20 m-0 mb-4 flex w-full bg-transparent p-0'
      bodyClassName='p-0 m-0 w-full flex -z-1'
    />
  )
}
