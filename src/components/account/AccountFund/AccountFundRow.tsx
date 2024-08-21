import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import useAsset from 'hooks/assets/useAsset'
import { findBalanceForAsset } from 'utils/balances'
import { BN } from 'utils/helpers'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

interface Props {
  amount: BigNumber
  balances: WrappedBNCoin[]
  denom: string
  chainName?: string
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string, chainName?: string) => void
}

export default function AccountFundRow(props: Props) {
  const asset = useAsset(props.denom)
  if (!asset) return null

  const balance = findBalanceForAsset(props.balances, props.denom, props.chainName || undefined)

  const chainName = props.chainName && props.chainName !== '' ? props.chainName : undefined

  return (
    <>
      <TokenInputWithSlider
        asset={asset}
        onChange={(amount) => props.updateFundingAssets(amount, props.denom, chainName)}
        amount={props.amount}
        max={BN(balance)}
        balances={props.balances.map((wrappedCoin) => wrappedCoin.coin)}
        maxText='Max'
        disabled={props.isConfirming}
        warningMessages={[]}
        chainName={chainName}
      />
      {asset.campaign && (
        <div className='flex justify-center w-full p-2 mt-4 border rounded border-white/20'>
          <AssetCampaignCopy
            asset={asset}
            size='sm'
            amount={props.amount}
            withLogo
            className='justify-center'
          />
        </div>
      )}
    </>
  )
}
