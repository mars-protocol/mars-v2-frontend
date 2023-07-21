import { useShuttle } from '@delphi-labs/shuttle-react'
import classNames from 'classnames'
import Image from 'next/image'
import React, { useState } from 'react'
import QRCode from 'react-qr-code'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { ChevronLeft, ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import WalletTutorial from 'components/Wallet/WalletTutorial'
import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import { WALLETS } from 'constants/wallets'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { isAndroid, isIOS, isMobile } from 'utils/mobile'

const currentChainId = ENV.CHAIN_ID
const currentChain = CHAINS[currentChainId]

const mapErrorMessages = (providerId: string, errorMessage: string) => {
  if (providerId === 'station') {
    if (errorMessage.match('Wallet not connected to the network with chainId')) {
      return `Your wallet is not connected to the correct network. Please switch your wallet to the ${currentChain.name} network`
    }
  }

  return errorMessage
}
export default function WalletSelect() {
  const { extensionProviders, mobileProviders, connect, mobileConnect, simulate, sign, broadcast } =
    useShuttle()
  const [isConnecting, setIsConnecting] = useToggle(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')

  const sortedExtensionProviders = extensionProviders.sort((a, b) => {
    const sortValueA = a.initialized ? 0 : 1
    const sortValueB = b.initialized ? 0 : 1
    return sortValueA - sortValueB
  })

  const handleConnectClick = async (extensionProviderId: string, chainId: string) => {
    setIsConnecting(true)

    try {
      const response = await connect({ extensionProviderId, chainId })
      const cosmClient = await CosmWasmClient.connect(response.network.rpc)
      const walletClient: WalletClient = {
        broadcast,
        cosmWasmClient: cosmClient,
        connectedWallet: response,
        sign,
        simulate,
      }
      useStore.setState({
        client: walletClient,
        address: response.account.address,
        focusComponent: <WalletFetchBalancesAndAccounts />,
      })
    } catch (error) {
      if (error instanceof Error) {
        useStore.setState({
          toast: {
            isError: true,
            title: 'Failed to connect to wallet',
            message: mapErrorMessages(extensionProviderId, error.message),
          },
        })
      }
    }
    setIsConnecting(false)
  }

  const handleMobileConnectClick = async (mobileProviderId: string, chainId: string) => {
    setIsConnecting(true)
    try {
      const urls = await mobileConnect({
        mobileProviderId,
        chainId,
      })

      if (isMobile()) {
        if (isAndroid()) {
          window.location.href = urls.androidUrl
        } else if (isIOS()) {
          window.location.href = urls.iosUrl
        } else {
          window.location.href = urls.androidUrl
        }
        setIsConnecting(true)
      } else {
        setQRCodeUrl(urls.qrCodeUrl)
        setIsConnecting(false)
      }
    } catch (error) {
      if (error instanceof Error) {
        useStore.setState({
          toast: {
            isError: true,
            title: 'Failed to connect to wallet',
            message: error.message,
          },
        })
      }
    }
  }

  function getTitle() {
    if (isConnecting) return 'Connecting...'
    if (qrCodeUrl) return 'Scan the QR Code'
    return 'Connect your wallet'
  }

  function getSubtitle() {
    if (isConnecting) return 'Unlock your wallet and approve the connection'
    if (qrCodeUrl)
      return 'Open your mobile wallet App and use the QR Scan function to connect via WalletConnect v2'
    return `Deposit assets from your ${currentChain.name} address to your Mars credit account.`
  }

  const hideWalletList = !!(qrCodeUrl || isConnecting)

  return (
    <div className='min-h-[600px] w-100'>
      <Text size='4xl' className='w-full pb-2 text-center'>
        {getTitle()}
      </Text>
      <Text size='sm' className='h-14 w-full text-center text-white/60'>
        {getSubtitle()}
      </Text>
      <div className='relative flex w-full flex-wrap'>
        {isConnecting && (
          <div className='absolute top-4 flex w-full justify-center'>
            <CircularProgress size={40} />
          </div>
        )}
        {qrCodeUrl && (
          <div className='absolute top-4 flex w-full flex-col items-center justify-center gap-2 text-center'>
            <div className='mb-4 rounded-sm bg-white p-2'>
              <QRCode value={qrCodeUrl} />
            </div>
            <Button
              color='secondary'
              leftIcon={<ChevronLeft />}
              iconClassName='w-3'
              onClick={() => setQRCodeUrl('')}
              text='Back'
            />
          </div>
        )}
        <div
          className={classNames(
            'flex w-full flex-wrap items-start gap-3 pt-4',
            hideWalletList && 'pointer-events-none opacity-0',
          )}
        >
          {!isMobile() && (
            <>
              {sortedExtensionProviders.map((provider) => {
                const walletId = provider.id as WalletID
                return (
                  <React.Fragment key={walletId}>
                    {Array.from(provider.networks.values())
                      .filter((network) => network.chainId === currentChainId)
                      .map((network) => {
                        if (!provider.initialized && !provider.initializing) {
                          return (
                            <Button
                              key={`${walletId}-${network.chainId}`}
                              color='tertiary'
                              className='flex w-full px-4 py-3'
                              onClick={() => {
                                window.open(WALLETS[walletId].installURL ?? '/', '_blank')
                              }}
                            >
                              <Image
                                className='rounded-full'
                                width={20}
                                height={20}
                                src={WALLETS[walletId].imageURL}
                                alt={WALLETS[walletId].install ?? 'Install'}
                              />
                              <Text className='ml-2 flex-1 text-left'>
                                {WALLETS[walletId].install}
                              </Text>
                              <ChevronRight className='h-4 w-4' />
                            </Button>
                          )
                        }

                        return (
                          <Button
                            key={`${walletId}-${network.chainId}`}
                            color='tertiary'
                            disabled={!provider.initialized}
                            className='flex w-full !justify-start px-4 py-3'
                            onClick={() => {
                              handleConnectClick(walletId, network.chainId)
                            }}
                          >
                            <Image
                              className='rounded-full'
                              width={20}
                              height={20}
                              src={WALLETS[walletId].imageURL}
                              alt={WALLETS[walletId].name ?? 'Conenct Wallet'}
                            />
                            <Text className='ml-2 flex-1 text-left'>{WALLETS[walletId].name}</Text>
                            <ChevronRight className='h-4 w-4' />
                          </Button>
                        )
                      })}
                  </React.Fragment>
                )
              })}
            </>
          )}
          {mobileProviders.map((provider) => {
            const walletId = provider.id as WalletID
            return (
              <React.Fragment key={walletId}>
                {Array.from(provider.networks.values())
                  .filter((network) => network.chainId === currentChainId)
                  .map((network) => {
                    return (
                      <Button
                        key={`${walletId}-${network.chainId}`}
                        color='tertiary'
                        className='flex w-full !justify-start px-4 py-3'
                        onClick={() => {
                          handleMobileConnectClick(walletId, network.chainId)
                        }}
                      >
                        <Image
                          className='rounded-full'
                          width={20}
                          height={20}
                          src={WALLETS[walletId].mobileImageURL ?? '/'}
                          alt={WALLETS[walletId].name ?? 'WalletConnect'}
                        />
                        <Text className='ml-2 flex-1 text-left'>
                          {WALLETS[walletId].walletConnect}
                        </Text>
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    )
                  })}
              </React.Fragment>
            )
          })}
          <WalletTutorial type='wallet' />
        </div>
      </div>
    </div>
  )
}
