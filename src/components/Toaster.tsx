import classNames from 'classnames'
import { ReactNode } from 'react'
import { toast as createToast, Slide, ToastContainer } from 'react-toastify'
import { mutate } from 'swr'

import { CheckCircled, Cross, CrossCircled, ExternalLink } from 'components/Icons'
import Text from 'components/Text'
import { TextLink } from 'components/TextLink'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { EXPLORER_NAME, EXPLORER_TX_URL } from 'constants/explorer'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { formatAmountWithSymbol } from 'utils/formatters'

function generateToastContent(content: ToastSuccess['content']): ReactNode {
  return content.map((item, index) => (
    <div className='flex flex-wrap w-full' key={index}>
      {item.coins.length > 0 && (
        <>
          <Text size='sm' className='w-full mb-1 text-white'>
            {item.text}
          </Text>
          <ul className='flex flex-wrap w-full gap-1 p-1 pl-4 list-disc'>
            {item.coins.map((coin) => (
              <li className='w-full p-0 text-sm text-white' key={coin.denom}>
                {formatAmountWithSymbol(coin.toCoin())}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  ))
}

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
            {isError ? (toast.title ? toast.title : 'Error') : 'Success'}
          </Text>
        </div>
        {!isError && toast.accountId && (
          <Text className='mb-1 font-bold text-white'>{`Credit Account ${toast.accountId}`}</Text>
        )}
        {toast.message && (
          <Text size='sm' className='font-bold text-white'>
            {toast.message}
          </Text>
        )}
        {!isError && toast.content?.length > 0 && generateToastContent(toast.content)}
        {toast.hash && (
          <div className='w-full'>
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
          </div>
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
