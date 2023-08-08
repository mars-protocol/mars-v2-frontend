import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from 'components/Button'
import { ArrowRight, Plus } from 'components/Icons'
import SwitchAutoLend from 'components/Switch/SwitchAutoLend'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import WalletBridges from 'components/Wallet/WalletBridges'
import { BN_ZERO } from 'constants/math'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom, getBaseAsset } from 'utils/assets'
import { BN } from 'utils/helpers'
import { defaultFee } from 'utils/constants'

interface Props {
  account: Account
  setChange: (change: AccountChange | undefined) => void
}

export default function FundAccount(props: Props) {
  const { account, setChange } = props
  const accountId = account.id
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const [isFunding, setIsFunding] = useToggle(false)
  const [fundingAssets, setFundingAssets] = useState<BNCoin[]>([])
  const { data: walletBalances } = useWalletBalances(address)
  const baseAsset = getBaseAsset()
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets =
    fundingAssets.length > 0 && fundingAssets.every((a) => a.toCoin().amount !== '0')

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  const selectedDenoms = useMemo(() => {
    return walletAssetModal?.selectedDenoms ?? []
  }, [walletAssetModal?.selectedDenoms])

  const handleClick = useCallback(async () => {
    setIsFunding(true)
    if (!accountId) return
    const result = await deposit({
      accountId,
      coins: fundingAssets,
    })
    setIsFunding(false)
    if (result) useStore.setState({ focusComponent: null, walletAssetsModal: null })
  }, [fundingAssets, accountId, setIsFunding, deposit])

  const handleSelectAssetsClick = useCallback(() => {
    useStore.setState({
      walletAssetsModal: {
        isOpen: true,
        selectedDenoms,
      },
    })
  }, [selectedDenoms])

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

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string) => {
      const assetToUpdate = fundingAssets.find(byDenom(denom))
      if (assetToUpdate) {
        assetToUpdate.amount = amount
        setFundingAssets([...fundingAssets.filter((a) => a.denom !== denom), assetToUpdate])
      }
      setChange({ deposits: fundingAssets })
    },
    [fundingAssets, setChange],
  )

  useEffect(() => {
    if (BN(baseBalance).isLessThan(defaultFee.amount[0].amount)) {
      useStore.setState({ focusComponent: <WalletBridges /> })
    }
  }, [baseBalance])

  return (
    <>
      <div className='flex flex-wrap items-start'>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {fundingAssets.map((coin) => {
          const asset = getAssetByDenom(coin.denom) as Asset

          const balance = walletBalances.find(byDenom(coin.denom))?.amount ?? '0'
          return (
            <TokenInputWithSlider
              key={coin.denom}
              asset={asset}
              onChange={(amount) => updateFundingAssets(amount, asset.denom)}
              amount={coin.amount ?? BN_ZERO}
              max={BN(balance)}
              balances={walletBalances}
              maxText='Max'
              className='w-full mb-4'
            />
          )
        })}
        <Button
          className='w-full mt-4'
          text='Select assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
        />
        <SwitchAutoLend
          className='pt-4 mt-4 border border-transparent border-t-white/10'
          accountId={accountId}
        />
      </div>
      <Button
        className='w-full mt-4'
        text='Fund account'
        rightIcon={<ArrowRight />}
        disabled={!hasFundingAssets}
        showProgressIndicator={isFunding}
        onClick={handleClick}
      />
    </>
  )
}
