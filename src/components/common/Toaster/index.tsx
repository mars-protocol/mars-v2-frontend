import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { Slide, ToastContainer, toast as toastify, ToastTransitionProps } from 'react-toastify'

import { CheckMark } from 'components/common/CheckMark'
import { CircularProgress } from 'components/common/CircularProgress'
import { ChevronDown, Cross, CrossCircled, ExternalLink } from 'components/common/Icons'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAssetsNoOraclePrices from 'hooks/assets/useAssetsNoOraclePrices'
import useChainConfig from 'hooks/chain/useChainConfig'
import useTransactionStore from 'hooks/common/useTransactionStore'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { formatAmountWithSymbol } from 'utils/formatters'
import { BN } from 'utils/helpers'

const toastBodyClasses = classNames(
  'flex flex-wrap w-full group/transaction',
  'p-4 shadow-overlay backdrop-blur-lg',
)

function isPromise(object?: any): object is ToastPending {
  if (!object) return false
  return 'promise' in object
}

const NoTransition: React.FC<ToastTransitionProps> = ({
  children,
  position,
  preventExitTransition,
  done,
  nodeRef,
  isIn,
  playToast,
}) => {
  React.useEffect(() => {
    if (isIn && playToast) {
      playToast()
    }
    if (!isIn && done) {
      done()
    }
  }, [isIn, done, playToast])

  return (
    <div ref={nodeRef as React.RefObject<HTMLDivElement>} data-position={position}>
      {children}
    </div>
  )
}

export function generateToastContent(content: ToastSuccess['content'], assets: Asset[]): ReactNode {
  return content.map((item, index) => (
    <React.Fragment key={index}>
      {item.text && (
        <div className='flex flex-wrap w-full mb-1'>
          {(!item.coins || item.coins.length > 0 || item.text.includes('Staked')) && (
            <Text size='sm' className='w-full mb-1 text-white'>
              {item.text}
            </Text>
          )}
          {item.coins.length > 0 && Number(item.coins[0].amount ?? 0) !== 0 && (
            <ul className='flex flex-wrap w-full gap-1 p-1 pl-4 list-disc'>
              {item.coins.map((coin, index) => {
                let prefix = ''
                if (item.text === 'Swapped') prefix = index % 2 === 0 ? 'from ' : 'to '

                return BN(coin.amount).isPositive() && formatAmountWithSymbol(coin, assets) ? (
                  <li className='w-full p-0 text-sm text-white' key={`${coin.denom}_${index}`}>
                    {`${prefix}${formatAmountWithSymbol(coin, assets, { abbreviated: false })}`}
                  </li>
                ) : (
                  <li className='w-full p-0 text-sm text-white' key={`${coin.denom}_${index}`}>
                    {`${prefix}unknown asset`}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </React.Fragment>
  ))
}

export default function Toaster() {
  const chainConfig = useChainConfig()
  const [reduceMotion] = useLocalStorage<boolean>(
    LocalStorageKeys.REDUCE_MOTION,
    getDefaultChainSettings(chainConfig).reduceMotion,
  )
  const { data: assets } = useAssetsNoOraclePrices()

  const toast = useStore((s) => s.toast)
  const { addTransaction } = useTransactionStore()

  const handlePending = (toast: ToastPending) => {
    const Content = () => (
      <div className='relative flex flex-wrap w-full m-0 isolate'>
        <div className='flex items-center w-full gap-2 mb-2'>
          <div className='flex items-center justify-center bg-info w-7 h-7'>
            <div className='w-4 h-4 -ml-1 -mt-1'>
              <CircularProgress />
            </div>
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
      position: 'bottom-right',
      transition: reduceMotion ? NoTransition : Slide,
    })
  }

  const handleResponse = (toast: ToastResponse, details?: boolean) => {
    const isError = toast?.isError
    if (!isError && toast.target) addTransaction(toast)
    const generalMessage = isError ? 'Transaction failed!' : 'Transaction completed successfully!'
    const showDetailElement = !!(!details && toast.hash)
    const Msg = () => (
      <div className='relative flex flex-wrap w-full m-0 isolate'>
        <div className='flex w-full gap-2 mb-2'>
          {isError ? (
            <div className='p-1.5 bg-error'>
              <span className='block w-4 h-4 text-white'>
                <CrossCircled />
              </span>
            </div>
          ) : (
            <div className='flex items-center justify-center bg-success w-7 h-7'>
              <div
                className={classNames('w-4 h-4 -ml-1 text-white', reduceMotion ? '-mt-2' : '-mt-1')}
              >
                <CheckMark />
              </div>
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
          {!isError && toast.target && (
            <Text className='mb-1 font-bold text-white'>{toast.target}</Text>
          )}
          {showDetailElement && toast.message && (
            <Text size='sm' className='w-full mb-1 text-white'>
              {toast.message}
            </Text>
          )}
          {!isError && toast.content?.length > 0 && generateToastContent(toast.content, assets)}
          {toast.hash && (
            <div className='w-full'>
              <TextLink
                href={`${chainConfig.endpoints.explorer}/tx/${toast.hash}`}
                target='_blank'
                className={classNames(
                  'leading-4 underline mt-4 hover:no-underline hover:text-white',
                  isError ? 'text-error' : 'text-success',
                )}
                title={`View on ${chainConfig.explorerName}`}
              >
                {`View on ${chainConfig.explorerName}`}
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
        progressClassName: classNames('h-px bg-none', isError ? 'bg-error' : 'bg-success'),
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
        progressClassName: classNames('h-px bg-none', isError ? 'bg-error' : 'bg-success'),
      })
    }

    useStore.setState({ toast: null })
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
      transition={reduceMotion ? NoTransition : Slide}
      className='p-0 w-[345px] max-w-full'
    />
  )
}
