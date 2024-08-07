import useChainConfig from 'hooks/chain/useChainConfig'
import CosmosWalletBridges from 'components/Wallet/CosmosWalletBridges'
import EvmSupportedBridges from 'components/Wallet/EvmSupportedBridges'

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

  return (
    <FullOverlayContent
      title={`${chainConfig.defaultCurrency?.coinDenom ?? 'Gas token'} required!`}
      copy={`To get started, you'll need at least a small amount of ${
        chainConfig.defaultCurrency?.coinDenom ?? 'the current chains gas token'
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
    </FullOverlayContent>
  )
}
