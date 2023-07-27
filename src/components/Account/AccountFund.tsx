import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from 'components/Button'
import Card from 'components/Card'
import FullOverlayContent from 'components/FullOverlayContent'
import { Plus } from 'components/Icons'
import SwitchWithLabel from 'components/SwitchWithLabel'
import Text from 'components/Text'
import TokenInputWithSlider from 'components/TokenInputWithSlider'
import WalletBridges from 'components/Wallet/WalletBridges'
import { BN_ZERO } from 'constants/math'
import useAccounts from 'hooks/useAccounts'
import useAutoLendEnabledAccountIds from 'hooks/useAutoLendEnabledAccountIds'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useToggle from 'hooks/useToggle'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getAssetByDenom, getBaseAsset } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'

export default function AccountFund() {
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const walletAssetModal = useStore((s) => s.walletAssetsModal)
  const { accountId } = useParams()
  const { data: accounts } = useAccounts(address)
  const currentAccount = useCurrentAccount()
  const [isFunding, setIsFunding] = useToggle(false)
  const [selectedAccountId, setSelectedAccountId] = useState<null | string>(null)
  const [fundingAssets, setFundingAssets] = useState<Coin[]>([])
  const { data: walletBalances } = useWalletBalances(address)
  const baseAsset = getBaseAsset()
  const { autoLendEnabledAccountIds, toggleAutoLend } = useAutoLendEnabledAccountIds()
  const isAutoLendEnabled = autoLendEnabledAccountIds.includes(accountId ?? '0')
  const hasAssetSelected = fundingAssets.length > 0
  const hasFundingAssets = fundingAssets.length > 0 && fundingAssets.every((a) => a.amount !== '0')

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
      fee: hardcodedFee,
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

    const newFundingAssets = selectedDenoms.map((denom) => ({
      denom,
      amount: fundingAssets.find((asset) => asset.denom === denom)?.amount ?? '0',
    }))

    setFundingAssets(newFundingAssets)
  }, [selectedDenoms, fundingAssets])

  const updateFundingAssets = useCallback(
    (amount: BigNumber, denom: string) => {
      const assetToUpdate = fundingAssets.find((asset) => asset.denom === denom)
      if (assetToUpdate) {
        assetToUpdate.amount = amount.toString()
        setFundingAssets([...fundingAssets.filter((a) => a.denom !== denom), assetToUpdate])
      }
    },
    [fundingAssets],
  )

  useEffect(() => {
    if (BN(baseBalance).isLessThan(hardcodedFee.amount[0].amount)) {
      useStore.setState({ focusComponent: <WalletBridges /> })
    }
  }, [baseBalance])

  useEffect(() => {
    if (accounts && !selectedAccountId && accountId)
      setSelectedAccountId(currentAccount?.id ?? accountId)
  }, [accounts, selectedAccountId, accountId, currentAccount])

  if (!selectedAccountId) return null

  return (
    <FullOverlayContent
      title={`Fund Credit Account #${selectedAccountId}`}
      copy='In order to start trading with this account, you need to deposit funds.'
      docs='fund'
    >
      <Card className='w-full bg-white/5 p-6'>
        {!hasAssetSelected && <Text>Please select an asset.</Text>}
        {selectedDenoms.map((denom) => {
          const asset = getAssetByDenom(denom) as Asset

          const balance = walletBalances.find(byDenom(asset.denom))?.amount ?? '0'
          return (
            <div
              key={asset.symbol}
              className='w-full rounded-base border border-white/20 bg-white/5 p-4'
            >
              <TokenInputWithSlider
                asset={asset}
                onChange={(amount) => updateFundingAssets(amount, asset.denom)}
                amount={BN_ZERO}
                max={BN(balance)}
                balances={walletBalances}
                maxText='Max'
              />
            </div>
          )
        })}

        <Button
          className='mt-4 w-full'
          text='Select assets'
          color='tertiary'
          rightIcon={<Plus />}
          iconClassName='w-3'
          onClick={handleSelectAssetsClick}
        />
        <div className='mt-4 border border-transparent border-t-white/10 pt-4'>
          <SwitchWithLabel
            name='isLending'
            label='Lend assets to earn yield'
            value={isAutoLendEnabled}
            onChange={() => toggleAutoLend(selectedAccountId)}
            tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
          />
        </div>
        <Button
          className='mt-4 w-full'
          text='Fund account'
          color='tertiary'
          disabled={!hasFundingAssets}
          showProgressIndicator={isFunding}
          onClick={handleClick}
          size='lg'
        />
      </Card>
    </FullOverlayContent>
  )
}
