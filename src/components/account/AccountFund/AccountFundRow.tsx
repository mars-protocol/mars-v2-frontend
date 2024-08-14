import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  amount: BigNumber
  balances: BNCoin[]
  denom: string
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string) => void
}

export default function AccountFundRow(props: Props) {
  const asset = useAsset(props.denom)

  if (!asset) return null

  const balance = props.balances.find(byDenom(props.denom))?.amount ?? BN_ZERO

  return (
    <>
      <TokenInputWithSlider
        asset={asset}
        onChange={(amount) => props.updateFundingAssets(amount, asset.denom)}
        amount={props.amount}
        max={balance}
        balances={props.balances}
        maxText='Max'
        disabled={props.isConfirming}
        warningMessages={[]}
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
