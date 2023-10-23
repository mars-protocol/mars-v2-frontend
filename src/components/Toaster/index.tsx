import classNames from 'classnames'
import { ReactNode } from 'react'
import { Slide, ToastContainer, toast as toastify } from 'react-toastify'
import { mutate } from 'swr'

import { CheckMark } from 'components/CheckMark'
import { CircularProgress } from 'components/CircularProgress'
import { ChevronDown, Cross, CrossCircled, ExternalLink } from 'components/Icons'
import Text from 'components/Text'
import { TextLink } from 'components/TextLink'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { EXPLORER_NAME, EXPLORER_TX_URL } from 'constants/explorer'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import useTransactionStore from 'hooks/useTransactionStore'
import useStore from 'store'
import { formatAmountWithSymbol } from 'utils/formatters'
import { BN } from 'utils/helpers'

const toastBodyClasses = classNames(
  'flex flex-wrap w-full group/transaction',
  'rounded-sm p-4 shadow-overlay backdrop-blur-lg',
  'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
)

function isPromise(object?: any): object is ToastPending {
  if (!object) return false
  return 'promise' in object
}

export function generateToastContent(content: ToastSuccess['content']): ReactNode {
  return content.map((item, index) => (
    <div className='flex flex-wrap w-full' key={index}>
      {item.coins.length > 0 && (
        <>
          <Text size='sm' className='w-full mb-1 text-white'>
            {item.text}
          </Text>
          <ul className='flex flex-wrap w-full gap-1 p-1 pl-4 list-disc'>
            {item.coins.map((coin) =>
              BN(coin.amount).isZero() ? null : (
                <li className='w-full p-0 text-sm text-white' key={coin.denom}>
                  {formatAmountWithSymbol(coin)}
                </li>
              ),
            )}
          </ul>
        </>
      )}
    </div>
  ))
}

export default function Toaster() {
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const toast = useStore((s) => s.toast)
  const { addTransaction } = useTransactionStore()

  const handlePending = (toast: ToastPending) => {
    const Content = () => (
      <div className='relative flex flex-wrap w-full m-0 isolate'>
        <div className='flex items-center w-full gap-2 mb-2'>
          <div className='rounded-sm p-1.5 pt-1 bg-info w-7 h-7 flex items-center'>
            <CircularProgress size={16} />
          </div>
          <Text className='flex items-center font-bold text-info'>Pending Transaction</Text>
        </div>
        <Text size='sm' className='w-full text-white'>
          Approve the transaction
          <br />
          and wait for its confirmation.
        </Text>
      </div>
    )

    toastify(Content, {
      toastId: toast.id,
      className: classNames(toastBodyClasses, 'toast-pending'),
      icon: false,
      draggable: false,
      closeOnClick: false,
      hideProgressBar: true,
      autoClose: false,
    })
  }

  const handleResponse = (toast: ToastResponse, details?: boolean) => {
    const isError = toast?.isError
    if (!isError) addTransaction(toast)
    const generalMessage = isError ? 'Transaction failed!' : 'Transaction completed successfully!'
    const showDetailElement = !!(!details && toast.hash)
    const Msg = () => (
      <div className='relative flex flex-wrap w-full m-0 isolate'>
        <div className='flex w-full gap-2 mb-2'>
          {isError ? (
            <div className='rounded-sm p-1.5 bg-error'>
              <span className='block w-4 h-4 text-white'>
                <CrossCircled />
              </span>
            </div>
          ) : (
            <div className='rounded-sm p-1.5 pt-1 bg-success w-7 h-7  flex items-center'>
              <CheckMark size={16} />
            </div>
          )}
          <Text
            className={classNames(
              'flex items-center font-bold',
              isError ? 'text-error' : 'text-success',
            )}
          >
            {isError ? (toast.title ? toast.title : 'Error') : 'Success'}
          </Text>
        </div>
        <Text size='sm' className='w-full mb-2 text-white'>
          {showDetailElement ? generalMessage : toast.message}
        </Text>
        {showDetailElement && (
          <Text
            size='sm'
            className='flex items-center w-auto pb-0.5 text-white border-b border-white/40 border-dashed group-hover/transaction:opacity-0'
          >
            <ChevronDown className='w-3 mr-1' />
            Transaction Details
          </Text>
        )}
        <div
          className={classNames(
            'w-full flex-wrap',
            showDetailElement && 'hidden group-hover/transaction:flex',
          )}
        >
          {!isError && toast.accountId && (
            <Text className='mb-1 font-bold text-white'>{`Credit Account ${toast.accountId}`}</Text>
          )}
          {showDetailElement && toast.message && (
            <Text size='sm' className='w-full mb-1 text-white'>
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
        </div>
        <div className='absolute top-0 right-0'>
          <Cross className={classNames('h-2 w-2', isError ? 'text-error' : 'text-success')} />
        </div>
      </div>
    )

    const toastElement = document.getElementById(String(toast.id))

    if (toastElement) {
      toastify.update(toast.id, {
        render: Msg,
        className: toastBodyClasses,
        type: isError ? 'error' : 'success',
        icon: false,
        draggable: false,
        closeOnClick: true,
        autoClose: 5000,
        progressClassName: classNames('h-[1px] bg-none', isError ? 'bg-error' : 'bg-success'),
        hideProgressBar: false,
      })
    } else {
      toastify(Msg, {
        toastId: toast.id,
        className: toastBodyClasses,
        type: isError ? 'error' : 'success',
        icon: false,
        draggable: false,
        closeOnClick: true,
        autoClose: 5000,
        progressClassName: classNames('h-[1px] bg-none', isError ? 'bg-error' : 'bg-success'),
      })
    }

    useStore.setState({ toast: null })
    mutate(() => true)
  }

  if (toast) {
    if (isPromise(toast)) {
      handlePending(toast)
    } else {
      handleResponse(toast)
    }
  }

  return (
    <ToastContainer
      closeButton={false}
      position='top-right'
      newestOnTop
      closeOnClick={false}
      transition={reduceMotion ? undefined : Slide}
      bodyClassName='p-0 m-0 -z-1'
      className='mt-[81px] p-0'
    />
  )
}
