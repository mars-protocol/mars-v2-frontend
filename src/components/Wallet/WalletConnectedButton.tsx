import { useShuttle } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { resolvePrimaryDomainByAddress } from 'ibc-domains-sdk'
import { useCallback, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation, useNavigate } from 'react-router-dom'
import useClipboard from 'react-use-clipboard'

import chains from 'chains'
import RecentTransactions from 'components/Wallet/RecentTransactions'
import WalletSelect from 'components/Wallet/WalletSelect'
import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { Check, Copy, ExternalLink, Wallet } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useICNSDomain from 'hooks/wallet/useICNSDomain'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { ChainInfoID, NETWORK } from 'types/enums'
import { truncate } from 'utils/formatters'
import { getPage, getRoute } from 'utils/route'

export default function WalletConnectedButton() {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------

  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()
  const address = currentWallet?.account.address
  const userDomain = useStore((s) => s.userDomain)
  const focusComponent = useStore((s) => s.focusComponent)
  const network = useStore((s) => s.client?.connectedWallet.network)
  const chainConfig = useChainConfig()
  const baseAsset = useBaseAsset()
  const { data: walletBalances, isLoading } = useWalletBalances(address)
  const { data: icnsData, isLoading: isLoadingICNS } = useICNSDomain(address)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // ---------------
  // LOCAL STATE
  // ---------------
  const [showDetails, setShowDetails] = useToggle()
  const [walletAmount, setWalletAmount] = useState(BN_ZERO)
  const [isCopied, setCopied] = useClipboard(address || '', {
    successDuration: 1000 * 5,
  })
  // ---------------
  // VARIABLES
  // ---------------
  const explorerName = network && chains[network.chainId as ChainInfoID].explorerName

  const viewOnFinder = useCallback(() => {
    const explorerUrl = network && chains[network.chainId as ChainInfoID].endpoints.explorer

    window.open(`${explorerUrl}/account/${address}`, '_blank')
  }, [network, address])

  const onDisconnectWallet = () => {
    if (currentWallet) disconnectWallet(currentWallet)

    useStore.setState({
      client: undefined,
      address: undefined,
      userDomain: undefined,
      balances: [],
      focusComponent: null,
    })

    if (focusComponent) {
      useStore.setState({
        focusComponent: {
          component: <WalletSelect />,
          onClose: () => {
            useStore.setState({ focusComponent: null })
          },
        },
      })
    }

    navigate(getRoute(getPage(pathname), new URLSearchParams()))
  }

  useEffect(() => {
    const fetchIBCDomain = async () => {
      if (!address || isLoadingICNS) return
      resolvePrimaryDomainByAddress(address).then((result) => {
        if (result.isOk()) {
          const userDomain = result.value as CommonSlice['userDomain']
          useStore.setState({ userDomain })
        } else {
          useStore.setState({ userDomain: undefined })
        }
      })
    }

    if (icnsData?.primary_name) {
      const userDomain = icnsData.primary_name
      useStore.setState({
        userDomain: { domain: userDomain.split('.')[0], domain_full: userDomain },
      })
    } else {
      fetchIBCDomain()
    }
  }, [icnsData?.primary_name, isLoadingICNS, address])

  useEffect(() => {
    const newAmount = BigNumber(
      walletBalances.find((coin: Coin) => coin.denom === baseAsset.denom)?.amount ?? 0,
    ).shiftedBy(-baseAsset.decimals)
    if (walletAmount.isEqualTo(newAmount)) return
    setWalletAmount(newAmount)
    useStore.setState({ balances: walletBalances })
  }, [walletBalances, baseAsset.denom, baseAsset.decimals, walletAmount])

  return (
    <div className='relative'>
      {chainConfig.network !== NETWORK.MAINNET && (
        <Text
          className='absolute -right-2 -top-2.5 z-10 rounded-sm p-0.5 px-2 gradient-primary-to-secondary'
          size='3xs'
          uppercase
        >
          {chainConfig.id}
        </Text>
      )}

      <Button
        variant='solid'
        leftIcon={<Wallet />}
        color='secondary'
        onClick={() => {
          setShowDetails(!showDetails)
        }}
        hasFocus={showDetails}
      >
        <span className='hidden md:inline'>
          {userDomain?.domain ? userDomain.domain : truncate(address, [2, 4])}
        </span>
        <div
          className={classNames(
            'relative ml-2 flex h-full items-center pl-2 number',
            'before:content-[" "] before:absolute before:bottom-1.5 before:left-0 before:top-0.5 before:h-[calc(100%-4px)] before:border-l before:border-white/20',
          )}
        >
          {isLoading ? (
            <CircularProgress size={12} />
          ) : (
            <FormattedNumber
              amount={walletAmount.toNumber()}
              options={{ suffix: ` ${baseAsset.symbol}`, abbreviated: true }}
              animate
            />
          )}
        </div>
      </Button>
      <Overlay
        className={classNames(
          isMobile ? 'top-18 h-[calc(100dvh-72px)]' : 'top-10',
          focusComponent ? '-left-[110px]' : 'right-0',
        )}
        show={showDetails}
        setShow={setShowDetails}
      >
        <div className='flex max-w-screen-full w-[440px] flex-wrap p-6'>
          <div className='flex items-start w-full mb-4 flex-0 flex-nowrap'>
            <div className='flex flex-1 w-auto'>
              <div className='mr-2 flex h-[31px] items-end text-base-caps'>{baseAsset.symbol}</div>
              <div className='flex flex-wrap justify-end flex-0'>
                <FormattedNumber
                  animate
                  className='flex items-end h-[31px] text-2xl !leading-5'
                  amount={walletAmount.toNumber()}
                />
              </div>
            </div>
            <div className='flex h-[31px] w-[116px] justify-end'>
              <Button color='tertiary' onClick={onDisconnectWallet} text='Disconnect' />
            </div>
          </div>
          <div className='flex flex-wrap w-full gap-2'>
            <Text size='lg'>
              {userDomain?.domain_full ? userDomain.domain_full : 'Your Address'}
            </Text>

            <Text size='sm' className={classNames('hidden break-all text-white/60', 'md:block')}>
              {address}
            </Text>
            <Text
              size='sm'
              className={classNames('break-all font-bold text-white/60', 'md:hidden')}
            >
              {truncate(address, [14, 14])}
            </Text>
            <div className='flex flex-wrap w-full gap-4 pt-2 md:gap-6 md:flex-nowrap'>
              <Button
                leftIcon={isCopied ? <Check /> : <Copy />}
                className='flex w-full md:w-auto'
                color='secondary'
                onClick={setCopied}
                text={isCopied ? 'Copied' : 'Copy Address'}
              />
              <Button
                leftIcon={<ExternalLink />}
                className='flex w-full md:w-auto'
                color='secondary'
                onClick={viewOnFinder}
              >
                <Text size='sm'>View on {explorerName}</Text>
              </Button>
            </div>
          </div>
        </div>
        <RecentTransactions />
      </Overlay>
    </div>
  )
}
