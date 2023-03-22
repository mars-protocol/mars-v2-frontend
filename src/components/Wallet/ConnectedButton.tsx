'use client'

import { Coin } from '@cosmjs/stargate'
import {
  ChainInfoID,
  SimpleChainInfoList,
  useWallet,
  useWalletManager,
} from '@marsprotocol/wallet-connector'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import useClipboard from 'react-use-clipboard'
import useSWR from 'swr'

import { Button } from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { FormattedNumber } from 'components/FormattedNumber'
import { Check, Copy, ExternalLink, Osmo } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import { Text } from 'components/Text'
import useStore from 'store'
import { getWalletBalances } from 'utils/api'
import { getBaseAsset } from 'utils/assets'
import { formatValue, truncate } from 'utils/formatters'

export default function ConnectedButton() {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const { disconnect } = useWallet()
  const { disconnect: terminate } = useWalletManager()
  const address = useStore((s) => s.client?.recentWallet.account?.address)
  const network = useStore((s) => s.client?.recentWallet.network)
  const baseAsset = getBaseAsset()

  const { data, isLoading } = useSWR(address, getWalletBalances)

  // ---------------
  // LOCAL STATE
  // ---------------
  const [showDetails, setShowDetails] = useState(false)
  const [walletAmount, setWalletAmount] = useState(0)
  const [isCopied, setCopied] = useClipboard(address || '', {
    successDuration: 1000 * 5,
  })
  // ---------------
  // VARIABLES
  // ---------------
  const explorerName = network && SimpleChainInfoList[network.chainId as ChainInfoID].explorerName

  const viewOnFinder = useCallback(() => {
    const explorerUrl = network && SimpleChainInfoList[network.chainId as ChainInfoID].explorer

    window.open(`${explorerUrl}/account/${address}`, '_blank')
  }, [network, address])

  const disconnectWallet = () => {
    disconnect()
    terminate()
    useStore.setState({ client: undefined })
  }

  useEffect(() => {
    if (!data || data.length === 0) return
    setWalletAmount(
      BigNumber(data?.find((coin: Coin) => coin.denom === baseAsset.denom)?.amount ?? 0)
        .div(10 ** baseAsset.decimals)
        .toNumber(),
    )
  }, [data, baseAsset.denom, baseAsset.decimals])

  return (
    <div className={'relative'}>
      {network?.chainId !== ChainInfoID.Osmosis1 && (
        <Text
          className='absolute -right-2 -top-2.5 z-10 rounded-lg p-0.5 px-2 gradient-primary-to-secondary'
          size='3xs'
          uppercase
        >
          {network?.chainId}
        </Text>
      )}

      <Button
        variant='solid'
        color='tertiary'
        leftIcon={<Osmo />}
        onClick={() => {
          setShowDetails(!showDetails)
        }}
      >
        <span>{truncate(address, [2, 4])}</span>
        <div
          className={classNames(
            'relative ml-2 flex h-full items-center pl-2 number',
            'before:content-[" "] before:absolute before:top-0.5 before:bottom-1.5 before:left-0 before:h-[calc(100%-4px)] before:border-l before:border-white/20',
          )}
        >
          {isLoading ? (
            <CircularProgress size={12} />
          ) : (
            `${formatValue(walletAmount, { suffix: baseAsset.symbol })}`
          )}
        </div>
      </Button>
      <Overlay className='right-0 mt-2' show={showDetails} setShow={setShowDetails}>
        <div className='flex w-[440px] flex-wrap p-6'>
          <div className='flex-0 mb-4 flex w-full flex-nowrap items-start'>
            <div className='flex w-auto flex-1'>
              <div className='mr-2 flex h-[31px] items-end pb-0.5  text-base-caps'>
                {baseAsset.denom}
              </div>
              <div className='flex-0 flex flex-wrap justify-end'>
                <FormattedNumber
                  animate
                  className='flex items-end text-2xl '
                  amount={walletAmount}
                />
              </div>
            </div>
            <div className='flex h-[31px] w-[116px] justify-end'>
              <Button color='secondary' onClick={disconnectWallet} text='Disconnect' />
            </div>
          </div>
          <div className='flex w-full flex-wrap'>
            <Text uppercase className='/80 mb-1 break-all'>
              {'Your Address'}
            </Text>

            <Text size='sm' className='mb-1 hidden break-all font-bold  md:block'>
              {address}
            </Text>
            <Text size='sm' className='mb-1 break-all font-bold  md:hidden'>
              {truncate(address, [14, 14])}
            </Text>
            <div className='flex w-full pt-1'>
              <Button
                leftIcon={isCopied ? <Check /> : <Copy />}
                variant='transparent'
                className='mr-10 flex w-auto py-2'
                color='quaternary'
                onClick={setCopied}
                text={isCopied ? 'Copied' : 'Copy Address'}
              />
              <Button
                leftIcon={<ExternalLink />}
                variant='transparent'
                className='flex w-auto py-2'
                color='quaternary'
                onClick={viewOnFinder}
              >
                <Text size='sm'>View on {explorerName}</Text>
              </Button>
            </div>
          </div>
        </div>
      </Overlay>
    </div>
  )
}
