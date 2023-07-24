import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useShuttle } from '@delphi-labs/shuttle-react'
import Image from 'next/image'
import React, { useState } from 'react'
import QRCode from 'react-qr-code'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import FullOverlayContent from 'components/FullOverlayContent'
import { ChevronLeft, ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import { WALLETS } from 'constants/wallets'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { isAndroid, isIOS, isMobile } from 'utils/mobile'

interface WalletOptionProps {
  name: string
  imageSrc: string
  handleClick: () => void
}

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

function WalletOption(props: WalletOptionProps) {
  return (
    <Button
      color='tertiary'
      className='flex w-full !justify-start px-4 py-3'
      onClick={props.handleClick}
    >
      <Image
        className='rounded-full'
        width={20}
        height={20}
        src={props.imageSrc}
        alt={props.name}
      />
      <Text className='ml-2 flex-1 text-left'>{props.name}</Text>
      <ChevronRight className='h-4 w-4' />
    </Button>
  )
}

export default function WalletSelect() {
  const { extensionProviders, mobileProviders, connect, mobileConnect, simulate, sign, broadcast } =
    useShuttle()
  const [isConnecting, setIsConnecting] = useToggle(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')

  const sortedExtensionProviders = extensionProviders.sort((a, b) => +b - +a)

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

  if (isConnecting)
    return (
      <FullOverlayContent
        title={'Connecting...'}
        copy={'Unlock your wallet and approve the connection'}
      >
        <CircularProgress size={40} />
      </FullOverlayContent>
    )

  if (qrCodeUrl)
    return (
      <FullOverlayContent
        title={'Scan the QR Code'}
        copy={
          'Open your mobile wallet App and use the QR Scan function to connect via WalletConnect v2'
        }
        button={{
          color: 'secondary',
          leftIcon: <ChevronLeft />,
          iconClassName: 'w-3',
          onClick: () => setQRCodeUrl(''),
          text: 'Back',
        }}
      >
        <div className='mb-4 rounded-sm bg-white p-2'>
          <QRCode value={qrCodeUrl} />
        </div>
      </FullOverlayContent>
    )

  return (
    <FullOverlayContent
      title={'Connect your wallet'}
      copy={`Deposit assets from your ${currentChain.name} address to your Mars credit account.`}
      docs='wallet'
    >
      <div className='flex w-full flex-wrap gap-3'>
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
                          <WalletOption
                            key={`${walletId}-${network.chainId}`}
                            handleClick={() => {
                              window.open(WALLETS[walletId].installURL ?? '/', '_blank')
                            }}
                            imageSrc={WALLETS[walletId].imageURL}
                            name={WALLETS[walletId].install ?? 'Install Wallet'}
                          />
                        )
                      }

                      return (
                        <WalletOption
                          key={`${walletId}-${network.chainId}`}
                          handleClick={() => handleConnectClick(walletId, network.chainId)}
                          imageSrc={WALLETS[walletId].imageURL}
                          name={WALLETS[walletId].name ?? 'Conenct Wallet'}
                        />
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
                    <WalletOption
                      key={`${walletId}-${network.chainId}`}
                      name={WALLETS[walletId].walletConnect ?? 'WalletConnect'}
                      imageSrc={WALLETS[walletId].mobileImageURL ?? '/'}
                      handleClick={() => handleMobileConnectClick(walletId, network.chainId)}
                    />
                  )
                })}
            </React.Fragment>
          )
        })}
      </div>
    </FullOverlayContent>
  )
}
