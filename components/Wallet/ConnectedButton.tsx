import {
  ChainInfoID,
  SimpleChainInfoList,
  useWallet,
  useWalletManager,
} from '@marsprotocol/wallet-connector'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import useClipboard from 'react-use-clipboard'

import Button from 'components/Button'
import CircularProgress from 'components/CircularProgress'
import FormattedNumber from 'components/FormattedNumber'
import CheckIcon from 'components/Icons/check.svg'
import CopyIcon from 'components/Icons/copy.svg'
import ExternalLinkIcon from 'components/Icons/external-link.svg'
import OsmoIcon from 'components/Icons/osmo.svg'
import WalletIcon from 'components/Icons/wallet.svg'
import { Overlay } from 'components/Overlay'
import Text from 'components/Text'
import useTokenBalance from 'hooks/useTokenBalance'
import { formatValue, truncate } from 'utils/formatters'

const ConnectedButton = () => {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const { disconnect } = useWalletManager()
  const { chainInfo, address, name } = useWallet()

  // ---------------
  // LOCAL HOOKS
  // ---------------
  const { data } = useTokenBalance()

  // ---------------
  // LOCAL STATE
  // ---------------
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isCopied, setCopied] = useClipboard(address || '', {
    successDuration: 1000 * 5,
  })

  // ---------------
  // VARIABLES
  // ---------------
  const explorerName =
    chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorerName

  const viewOnFinder = useCallback(() => {
    const explorerUrl = chainInfo && SimpleChainInfoList[chainInfo.chainId as ChainInfoID].explorer

    window.open(`${explorerUrl}account/${address}`, '_blank')
  }, [chainInfo, address])

  useEffect(() => {
    const loading = !(address && name && chainInfo)
    setIsLoading(loading)
  }, [address, name, chainInfo])

  return (
    <div className={'relative'}>
      {chainInfo?.chainId !== ChainInfoID.Osmosis1 && (
        <Text
          className='absolute -right-2 -top-2.5 rounded-lg bg-secondary-highlight p-0.5 px-2'
          size='3xs'
          uppercase
        >
          {chainInfo?.chainId}
        </Text>
      )}

      <button
        className='flex h-[31px] flex-1 flex-nowrap content-center items-center justify-center rounded-2xl border border-white/60 bg-secondary-dark/70 px-4 pt-0.5 text-sm text-white hover:border-white hover:bg-secondary-dark active:border-white active:bg-secondary-dark-10'
        onClick={() => {
          setShowDetails(!showDetails)
        }}
      >
        <span className='flex h-4 w-4 items-center justify-center'>
          {chainInfo?.chainId === ChainInfoID.Osmosis1 ||
          chainInfo?.chainId === ChainInfoID.OsmosisTestnet ? (
            <OsmoIcon />
          ) : (
            <WalletIcon />
          )}
        </span>
        <span className='ml-1.5'>{name ? name : truncate(address, [2, 4])}</span>
        <div
          className={classNames(
            'number relative ml-2 flex h-full items-center pl-2',
            'before:content-[" "] before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:h-[calc(100%-12px)] before:border-l before:border-white',
          )}
        >
          {!isLoading ? (
            `${formatValue(data, 2, 2, true, false, ` ${chainInfo?.stakeCurrency?.coinDenom}`)}`
          ) : (
            <CircularProgress size={12} />
          )}
        </div>
      </button>
      <Overlay className='right-0 mt-2' show={showDetails} setShow={setShowDetails}>
        <div className='flex w-[420px] flex-wrap p-6'>
          <div className='flex-0 mb-4 flex w-full flex-nowrap items-start'>
            <div className='flex w-auto flex-1'>
              <div className='mr-2 flex h-[31px] items-end pb-0.5 text-secondary-dark text-base-caps'>
                {chainInfo?.stakeCurrency?.coinDenom}
              </div>
              <div className='flex-0 flex flex-wrap justify-end'>
                <FormattedNumber
                  animate
                  className='flex items-end text-2xl text-secondary-dark'
                  amount={data}
                />
              </div>
            </div>
            <div className='flex h-[31px] w-[116px] justify-end'>
              <Button color='secondary' onClick={disconnect} text='Disconnect' />
            </div>
          </div>
          <div className='flex w-full flex-wrap'>
            <Text uppercase className='mb-1 break-all text-secondary-dark/80'>
              {name ? `‘${name}’` : 'Your Address'}
            </Text>

            <Text
              size='sm'
              className='mb-1 hidden break-all font-bold text-secondary-dark md:block'
            >
              {address}
            </Text>
            <Text size='sm' className='mb-1 break-all font-bold text-secondary-dark md:hidden'>
              {truncate(address, [14, 14])}
            </Text>
            <div className='flex w-full pt-1'>
              <button
                className='mr-10 flex w-auto appearance-none items-center border-none py-2 text-secondary-dark opacity-70 hover:opacity-100'
                onClick={setCopied}
              >
                <span className='mr-1 w-4'>
                  <CopyIcon />
                </span>
                {isCopied ? (
                  <Text size='sm'>
                    Copied <CheckIcon />
                  </Text>
                ) : (
                  <Text size='sm'>Copy Address</Text>
                )}
              </button>
              <button
                className='flex w-auto appearance-none items-center border-none py-2 text-secondary-dark opacity-70 hover:opacity-100'
                onClick={viewOnFinder}
              >
                <span className='mr-1 w-4'>
                  <ExternalLinkIcon />
                </span>
                <Text size='sm'>View on {explorerName}</Text>
              </button>
            </div>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

export default ConnectedButton
