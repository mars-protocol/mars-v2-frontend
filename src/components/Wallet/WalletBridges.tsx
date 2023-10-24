import { useShuttle } from '@delphi-labs/shuttle-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo } from 'react'

import Button from 'components/Button'
import FullOverlayContent from 'components/FullOverlayContent'
import { ChevronRight } from 'components/Icons'
import Text from 'components/Text'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import WalletSelect from 'components/Wallet/WalletSelect'
import { BRIDGES } from 'constants/bridges'
import { CHAINS } from 'constants/chains'
import { ENV } from 'constants/env'
import useCurrentWallet from 'hooks/useCurrentWallet'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { NETWORK } from 'types/enums/network'
import { byDenom } from 'utils/array'
import { getBaseAsset } from 'utils/assets'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'

const currentChainId = ENV.CHAIN_ID
const currentChain = CHAINS[currentChainId]

function Bridge({ name, url, image }: Bridge) {
  return (
    <Button
      color='tertiary'
      className='flex w-full px-4 py-3'
      onClick={() => {
        window.open(url, '_blank')
      }}
    >
      <Image className='rounded-full' width={20} height={20} src={image} alt={name} />
      <Text className='flex-1 ml-2 text-left'>{name}</Text>
      <ChevronRight className='w-4 h-4' />
    </Button>
  )
}

export default function WalletBridges() {
  const address = useStore((s) => s.address)
  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()
  const { data: walletBalances, isLoading } = useWalletBalances(address)
  const baseAsset = getBaseAsset()
  const [hasFunds, setHasFunds] = useToggle(false)

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const handleClick = useCallback(() => {
    if (!currentWallet) return
    disconnectWallet(currentWallet)
    useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [currentWallet, disconnectWallet])

  useEffect(() => {
    if (hasFunds) {
      useStore.setState({ focusComponent: { component: <WalletFetchBalancesAndAccounts /> } })
      return
    }

    if (BN(baseBalance).isGreaterThanOrEqualTo(defaultFee.amount[0].amount) && !isLoading)
      setHasFunds(true)
  }, [baseBalance, isLoading, hasFunds, setHasFunds])

  return (
    <FullOverlayContent
      title={`${currentChain.defaultCurrency?.coinDenom ?? 'Gas token'} required!`}
      copy={`To get started, you'll need at least a small amount of ${
        currentChain.defaultCurrency?.coinDenom ?? 'the current chains gas token'
      } to cover transaction fees on Mars. Fund your wallet or bridge some in from another chain.`}
      button={{
        className: 'w-full mt-4',
        text: 'Connect different wallet',
        color: 'tertiary',
        onClick: handleClick,
        size: 'lg',
      }}
      docs='wallet'
    >
      <div className='flex flex-wrap w-full gap-3'>
        {BRIDGES.map((bridge) => (
          <Bridge key={bridge.name} {...bridge} />
        ))}
      </div>
      {ENV.NETWORK !== NETWORK.MAINNET && (
        <div className='flex flex-wrap w-full gap-3'>
          <Text size='lg' className='mt-4 text-white'>
            Need Testnet Funds?
          </Text>
          <Bridge
            key='osmosis-faucet'
            name='Osmosis Testnet Faucet'
            url={
              ENV.NETWORK === NETWORK.TESTNET
                ? 'https://faucet.osmotest5.osmosis.zone/'
                : 'https://faucet.devnet.osmosis.zone/'
            }
            image='/images/tokens/osmo.svg'
          />
        </div>
      )}
    </FullOverlayContent>
  )
}
