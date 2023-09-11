import { useShuttle } from '@delphi-labs/shuttle-react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useClipboard from 'react-use-clipboard'

import Button from 'components/Button'
import { CircularProgress } from 'components/CircularProgress'
import { FormattedNumber } from 'components/FormattedNumber'
import { Check, Copy, ExternalLink, Osmo } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import RecentTransactions from 'components/Wallet/RecentTransactions'
import { CHAINS } from 'constants/chains'
import { IS_TESTNET } from 'constants/env'
import { BN_ZERO } from 'constants/math'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { ChainInfoID } from 'types/enums/wallet'
import { getBaseAsset, getEnabledMarketAssets } from 'utils/assets'
import { truncate } from 'utils/formatters'
import { getPage, getRoute } from 'utils/route'

export default function WalletConnectedButton() {
  // ---------------
  // EXTERNAL HOOKS
  // ---------------
  const marketAssets = getEnabledMarketAssets()
  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const network = useStore((s) => s.client?.connectedWallet.network)
  const baseAsset = getBaseAsset()
  const { data: walletBalances, isLoading } = useWalletBalances(address)
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
  const explorerName = network && CHAINS[network.chainId as ChainInfoID].explorerName

  const viewOnFinder = useCallback(() => {
    const explorerUrl = network && CHAINS[network.chainId as ChainInfoID].explorer

    window.open(`${explorerUrl}/account/${address}`, '_blank')
  }, [network, address])

  const onDisconnectWallet = () => {
    if (!currentWallet) return
    disconnectWallet(currentWallet)
    useStore.setState({ client: undefined, address: undefined, accounts: null, balances: [] })
    navigate(getRoute(getPage(pathname)))
  }

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
    <div className={'relative'}>
      {IS_TESTNET && (
        <Text
          className='absolute -right-2 -top-2.5 z-10 rounded-sm p-0.5 px-2 gradient-primary-to-secondary'
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
        hasFocus={showDetails}
      >
        <span>{truncate(address, [2, 4])}</span>
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
              <Button color='secondary' onClick={onDisconnectWallet} text='Disconnect' />
            </div>
          </div>
          <div className='flex flex-wrap w-full'>
            <Text uppercase className='mb-1 break-all /80'>
              {'Your Address'}
            </Text>

            <Text size='sm' className={classNames('mb-1 hidden break-all font-bold', 'md:block')}>
              {address}
            </Text>
            <Text size='sm' className={classNames('mb-1 break-all font-bold', 'md:hidden')}>
              {truncate(address, [14, 14])}
            </Text>
            <div className='flex w-full pt-1'>
              <Button
                leftIcon={isCopied ? <Check /> : <Copy />}
                variant='transparent'
                className='flex w-auto py-2 mr-10'
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
        <RecentTransactions />
      </Overlay>
    </div>
  )
}
