import { useShuttle } from '@delphi-labs/shuttle-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo } from 'react'

import Button from 'components/common/Button'
import FullOverlayContent from 'components/common/FullOverlayContent'
import { ChevronRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import WalletFetchBalancesAndAccounts from 'components/Wallet/WalletFetchBalancesAndAccounts'
import WalletSelect from 'components/Wallet/WalletSelect'
import { BRIDGES, NTRN_FAUCETS } from 'constants/bridges'
import useBaseAsset from 'hooks/assets/useBaseAsset'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { ChainInfoID } from 'types/enums'
import { byDenom } from 'utils/array'
import { defaultFee } from 'utils/constants'
import { BN } from 'utils/helpers'

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
  const chainConfig = useChainConfig()

  const address = useStore((s) => s.address)
  const currentWallet = useCurrentWallet()
  const { disconnectWallet } = useShuttle()
  const { data: walletBalances, isLoading } = useWalletBalances(address)
  const baseAsset = useBaseAsset()
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

    if (
      BN(baseBalance).isGreaterThanOrEqualTo(defaultFee(chainConfig).amount[0].amount) &&
      !isLoading
    )
      setHasFunds(true)
  }, [baseBalance, isLoading, hasFunds, setHasFunds, chainConfig])

  const isNeutronTestnet = useMemo(() => chainConfig.id === ChainInfoID.Pion1, [chainConfig])
  const [bridges, introText] = useMemo(
    () =>
      isNeutronTestnet
        ? [
            NTRN_FAUCETS,
            `To get started, you'll need at least a small amount of NTRN to cover transaction fees. You can get testnet funds from the Neutron Faucets in Discord or Telegram.`,
          ]
        : [
            BRIDGES,
            `To get started, you'll need at least a small amount of ${
              chainConfig.defaultCurrency?.coinDenom ?? 'the current chains gas token'
            } to cover transaction fees on Mars. Fund your wallet or bridge some in from another chain.`,
          ],
    [chainConfig.defaultCurrency?.coinDenom, isNeutronTestnet],
  )

  return (
    <FullOverlayContent
      title={`${chainConfig.defaultCurrency?.coinDenom ?? 'Gas token'} required!`}
      copy={introText}
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
        {bridges.map((bridge) => (
          <Bridge key={bridge.name} {...bridge} />
        ))}
      </div>
    </FullOverlayContent>
  )
}
