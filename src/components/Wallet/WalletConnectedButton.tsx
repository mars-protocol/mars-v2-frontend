import { useShuttle } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { resolvePrimaryDomainByAddress } from 'ibc-domains-sdk'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useClipboard from 'react-use-clipboard'

import Button from 'components/common/Button'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { Check, Copy, ExternalLink, Wallet } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import RecentTransactions from 'components/Wallet/RecentTransactions'
import WalletSelect from 'components/Wallet/WalletSelect'
import chains from 'configs/chains'
import { BN_ZERO } from 'constants/math'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useChainConfig from 'hooks/useChainConfig'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useICNSDomain from 'hooks/useICNSDomain'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'
import { truncate } from 'utils/formatters'
import { getPage, getRoute } from 'utils/route'

export default function WalletConnectedButton() {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------

  const marketAssets = useMarketEnabledAssets()
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
  const [searchParams] = useSearchParams()

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

    navigate(getRoute(getPage(pathname), searchParams))
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
    ).dividedBy(10 ** baseAsset.decimals)

    if (walletAmount.isEqualTo(newAmount)) return
    setWalletAmount(newAmount)

    const assetDenoms = marketAssets.map((asset) => asset.denom)
    const balances = walletBalances.filter((coin) => assetDenoms.includes(coin.denom))
    useStore.setState({ balances })
  }, [walletBalances, baseAsset.denom, baseAsset.decimals, marketAssets, walletAmount])

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
        <span>{userDomain?.domain ? userDomain.domain : truncate(address, [2, 4])}</span>
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
        className={classNames('mt-2', focusComponent ? '-left-[110px]' : 'right-0')}
        show={showDetails}
        setShow={setShowDetails}
      >
        <div className='flex w-[440px] flex-wrap p-6'>
          <div className='flex items-start w-full mb-4 flex-0 flex-nowrap'>
            <div className='flex flex-1 w-auto'>
              <div className='mr-2 flex h-[31px] items-end pb-0.5  text-base-caps'>
                {baseAsset.symbol}
              </div>
              <div className='flex flex-wrap justify-end flex-0'>
                <FormattedNumber
                  animate
                  className='flex items-end text-2xl '
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
            <div className='flex w-full gap-6 pt-2'>
              <Button
                leftIcon={isCopied ? <Check /> : <Copy />}
                className='flex w-auto'
                color='secondary'
                onClick={setCopied}
                text={isCopied ? 'Copied' : 'Copy Address'}
              />
              <Button
                leftIcon={<ExternalLink />}
                className='flex w-auto'
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
