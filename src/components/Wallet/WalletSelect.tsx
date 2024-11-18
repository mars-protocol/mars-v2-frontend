import { useShuttle } from '@delphi-labs/shuttle-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import QRCode from 'react-qr-code'

import WalletConnecting from 'components/Wallet/WalletConnecting'
import Button from 'components/common/Button'
import FullOverlayContent from 'components/common/FullOverlayContent'
import { ChevronLeft, ChevronRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import { DAODAO_ORIGINS, WALLETS } from 'constants/wallets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useStore from 'store'
import { WalletID } from 'types/enums'
import { isAndroid, isIOS } from 'utils/mobile'

interface Props {
  error?: ErrorObject
}

interface ErrorObject {
  title: string
  message: string
}

interface WalletOptionProps {
  name: string
  imageSrc: string
  handleClick: () => void
  showLoader?: boolean
}

function WalletOption(props: WalletOptionProps) {
  return (
    <Button
      color='tertiary'
      className='flex w-full !justify-start px-4 py-3 h-11'
      onClick={props.handleClick}
      showProgressIndicator={props.showLoader}
    >
      <Image
        className='rounded-full'
        width={20}
        height={20}
        src={props.imageSrc}
        alt={props.name}
      />
      <Text className='flex-1 ml-2 text-left'>{props.name}</Text>
      <ChevronRight className='w-4 h-4' />
    </Button>
  )
}

export default function WalletSelect(props: Props) {
  const chainConfig = useChainConfig()
  const { extensionProviders, mobileProviders, mobileConnect } = useShuttle()
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [error, setError] = useState(props.error)
  const [isLoading, setIsLoading] = useState<string | boolean>(false)
  const recentWallet = useCurrentWallet()
  const handleConnectClick = (extensionProviderId: string) => {
    useStore.setState({
      focusComponent: {
        component: <WalletConnecting providerId={extensionProviderId} />,
        onClose: () => {
          useStore.setState({ focusComponent: null })
        },
      },
    })
  }
  // this is currently "true" for other embeded browsers like leap and compass mobile apps
  const isKeplrMobileInApp =
    /**
     * type here currently comes from shuttle and doesn't define the mode property
     * @see https://github.com/chainapsis/keplr-wallet/blob/master/packages/types/src/wallet/keplr.ts#L63
     */
    typeof window !== 'undefined' &&
    (
      window.keplr as typeof window.keplr & {
        mode: KeplrMode
      }
    )?.mode === 'mobile-web'

  const isDaodaoIframe =
    window.location !== window.parent.location &&
    /**
     * referrer has a trailing slash like https://daodao.zone/
     * origins don't have a trailing slash like https://daodao.zone - doesn't work otherwise
     */
    DAODAO_ORIGINS.some((url) => document.referrer.startsWith(url))

  const sortedExtensionProviders = extensionProviders
    .sort((a, b) => +b - +a)
    .filter((provider) =>
      isDaodaoIframe ? provider.id === WalletID.DaoDao : provider.id !== WalletID.DaoDao,
    )

  const handleMobileConnectClick = async (mobileProviderId: string, chainId: string) => {
    setIsLoading(mobileProviderId)
    try {
      const urls = await mobileConnect({
        mobileProviderId,
        chainId,
      })

      if (isMobile) {
        if (isAndroid()) {
          window.location.href = urls.androidUrl
        } else if (isIOS()) {
          window.location.href = urls.iosUrl
        } else {
          window.location.href = urls.androidUrl
        }
      } else {
        setQRCodeUrl(urls.qrCodeUrl)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError({ title: 'Failed to connect to wallet', message: error.message })
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!recentWallet) return
    useStore.setState({
      focusComponent: {
        component: <WalletConnecting providerId={recentWallet?.providerId} />,
        onClose: () => {
          useStore.setState({ focusComponent: null })
        },
      },
    })
  }, [recentWallet])

  useEffect(() => {
    if (error?.message && error?.title) {
      useStore.setState({
        toast: {
          id: moment.now(),
          isError: true,
          title: error.title,
          message: error.message,
        },
      })
    }
  }, [error?.message, error?.title])

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
        <div className='p-2 mb-4 bg-white rounded-sm'>
          <QRCode value={qrCodeUrl} />
        </div>
      </FullOverlayContent>
    )

  return (
    <FullOverlayContent
      title={'Connect your wallet'}
      copy={`Deposit assets from your ${chainConfig.name} address to your Mars Credit Account.`}
      docs='wallet'
    >
      <div className='flex flex-wrap w-full gap-3'>
        {!isMobile && !isDaodaoIframe && (
          <>
            {sortedExtensionProviders.map((provider) => {
              const walletId = provider.id as WalletID
              return (
                <React.Fragment key={walletId}>
                  {Array.from(provider.networks.values())
                    .filter((network) => network.chainId === chainConfig.id)
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
                          handleClick={() => handleConnectClick(walletId)}
                          imageSrc={WALLETS[walletId].imageURL}
                          name={WALLETS[walletId].name ?? 'Connect Wallet'}
                        />
                      )
                    })}
                </React.Fragment>
              )
            })}
          </>
        )}
        {!isDaodaoIframe &&
          isMobile &&
          mobileProviders.map((provider) => {
            const walletId = provider.id as WalletID
            return (
              <React.Fragment key={walletId}>
                {Array.from(provider.networks.values())
                  .filter((network) => network.chainId === chainConfig.id)
                  .map((network) => {
                    return (
                      <WalletOption
                        key={`${walletId}-${network.chainId}`}
                        name={
                          isMobile
                            ? WALLETS[walletId].name
                            : (WALLETS[walletId].walletConnect ?? 'WalletConnect')
                        }
                        imageSrc={
                          isMobile
                            ? WALLETS[walletId].imageURL
                            : (WALLETS[walletId].mobileImageURL ?? '/')
                        }
                        handleClick={() =>
                          isKeplrMobileInApp
                            ? handleConnectClick(walletId.replace('mobile-', ''))
                            : handleMobileConnectClick(walletId, network.chainId)
                        }
                        showLoader={isLoading === walletId}
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
