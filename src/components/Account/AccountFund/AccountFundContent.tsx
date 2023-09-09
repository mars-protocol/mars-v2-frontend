import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/Button'
import DepositCapMessage from 'components/DepositCapMessage'
import { ArrowRight, Plus } from 'components/Icons'
import SwitchAutoLend from 'components/Switch/SwitchAutoLend'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import WalletBridges from 'components/Wallet/WalletBridges'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LEND_ASSETS_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
import useAutoLend from 'hooks/useAutoLend'
import useLocalStorage from 'hooks/useLocalStorage'
import useMarketAssets from 'hooks/useMarketAssets'
import useToggle from 'hooks/useToggle'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom, getBaseAsset } from 'utils/assets'
import { defaultFee } from 'utils/constants'
import { getCapLeftWithBuffer } from 'utils/generic'
import { BN } from 'utils/helpers'

interface Props {
  account?: Account
  address: string
  accountId: string
  isFullPage?: boolean
}

export default function AccountFundContent(props: Props) {
  const deposit = useStore((s) => s.deposit)
  const accounts = useStore((s) => s.accounts)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [lendAssets, setLendAssets] = useLocalStorage<boolean>(
    LEND_ASSETS_KEY,
    DEFAULT_SETTINGS.lendAssets,
  )
  const [isFunding, setIsFunding] = useToggle(false)
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const { data: marketAssets } = useMarketAssets()
  const { data: walletBalances } = useWalletBalances(props.address)
  const { autoLendEnabledAccountIds } = useAutoLend()
  const [isLending, toggleIsLending] = useToggle(false)
  const { simulateDeposits } = useUpdatedAccount(props.account)

  const baseAsset = getBaseAsset()

  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')
  const balances = walletBalances.map((coin) => new BNCoin(coin))

  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const handleSelectAssetsClick = useCallback(() => {
    useStore.setState({
      walletAssetsModal: {
        isOpen: true,
        selectedDenoms,
        isBorrow: false,
      },
    })
  }, [selectedDenoms])

  const handleClick = useCallback(async () => {
    setIsFunding(true)
    if (!props.accountId) return
    const result = await deposit({
      accountId: props.accountId,
      coins: fundingAssets,
      lend: isLending,
    })
    setIsFunding(false)
    if (result)
      useStore.setState({
        fundAndWithdrawModal: null,
        walletAssetsModal: null,
        focusComponent: null,
      })
  }, [setIsFunding, props.accountId, deposit, fundingAssets, isLending])

  useEffect(() => {
    if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) {
      useStore.setState({ focusComponent: { component: <WalletBridges /> } })
    }
  }, [baseBalance])

  useEffect(() => {
    simulateDeposits(isLending ? 'lend' : 'deposit', fundingAssets)
  }, [isLending, fundingAssets, simulateDeposits])

  useEffect(() => {
    const currentSelectedDenom = fundingAssets.map((asset) => asset.denom)

    if (
      selectedDenoms.every((denom) => currentSelectedDenom.includes(denom)) &&
      selectedDenoms.length === currentSelectedDenom.length
    )
      return

    const newFundingAssets = selectedDenoms.map((denom) =>
      BNCoin.fromDenomAndBigNumber(denom, BN(fundingAssets.find(byDenom(denom))?.amount ?? '0')),
    )

    setFundingAssets(newFundingAssets)
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback((amount: BigNumber, denom: string) => {
    setFundingAssets((fundingAssets) => {
      const updateIdx = fundingAssets.findIndex(byDenom(denom))
      if (updateIdx === -1) return fundingAssets

      fundingAssets[updateIdx].amount = amount
      return [...fundingAssets]
    })
  }, [])

  useEffect(() => {
    toggleIsLending(autoLendEnabledAccountIds.includes(props.accountId))
  }, [props.accountId, autoLendEnabledAccountIds, toggleIsLending])

  useEffect(() => {
    if (accounts?.length === 1 && isLending && !lendAssets) setLendAssets(true)
  }, [isLending, accounts, lendAssets, setLendAssets])

  const depositCapReachedCoins = useMemo(() => {
    const depositCapReachedCoins: BNCoin[] = []
    fundingAssets.forEach((asset) => {
      const marketAsset = marketAssets.find(byDenom(asset.denom))
      if (!marketAsset) return

      const capLeft = getCapLeftWithBuffer(marketAsset.cap)

      if (asset.amount.isLessThanOrEqualTo(capLeft)) return

      depositCapReachedCoins.push(BNCoin.fromDenomAndBigNumber(asset.denom, capLeft))
    })
    return depositCapReachedCoins
  }, [fundingAssets, marketAssets])

  return (
    <>
      <div>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin) => {
          const asset = getAssetByDenom(coin.denom) as Asset

          const balance = balances.find(byDenom(coin.denom))?.amount ?? BN_ZERO
          return (
            <div
              key={asset.symbol}
              className={classNames(
                'w-full mb-4',
                props.isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
              )}
            >
              <TokenInputWithSlider
                asset={asset}
                onChange={(amount) => updateFundingAssets(amount, asset.denom)}
                amount={coin.amount ?? BN_ZERO}
                max={balance}
                balances={balances}
                maxText='Max'
                disabled={isFunding}
              />
            </div>
          )
        })}

        <Button
          className='w-full mt-4'
          text='Select assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
          disabled={isFunding}
        />
        <DepositCapMessage
          action='fund'
          coins={depositCapReachedCoins}
          className='py-2 pr-4 mt-4'
          showIcon
        />
        <SwitchAutoLend
          className='pt-4 mt-4 border border-transparent border-t-white/10'
          accountId={props.accountId}
          value={!props.isFullPage ? isLending : undefined}
          onChange={!props.isFullPage ? toggleIsLending : undefined}
        />
      </div>
      <Button
        className='w-full mt-4'
        text='Fund account'
        disabled={!hasFundingAssets || depositCapReachedCoins.length > 0}
        showProgressIndicator={isFunding}
        onClick={handleClick}
        color={props.isFullPage ? 'tertiary' : undefined}
        size={props.isFullPage ? 'lg' : undefined}
        rightIcon={props.isFullPage ? undefined : <ArrowRight />}
      />
    </>
  )
}
