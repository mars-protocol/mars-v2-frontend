import { useMemo } from 'react'

import classNames from 'classnames'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePoolAssets from 'hooks/assets/usePoolAssets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  farm: Vault | DepositedVault | AstroLp | DepositedAstroLp
  account: Account
  isAstroLp: boolean
}

export default function FarmModalContentHeader(props: Props) {
  const { account, isAstroLp } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const poolTokens = usePoolAssets()
  const farm = isAstroLp ? (props.farm as DepositedAstroLp) : (props.farm as DepositedVault)
  const poolToken = poolTokens.find(byDenom(farm.denoms.lp))
  const depositedValue = useMemo(() => {
    if (!isAstroLp) return BN_ZERO
    const vault = farm as DepositedVault
    if ('values' in farm) {
      const value = vault.values.primary
        .plus(vault.values.secondary)
        .plus(vault.values.unlocked)
        .plus(vault.values.unlocking)
        .shiftedBy(-PRICE_ORACLE_DECIMALS)

      return value
    } else {
      return BN_ZERO
    }
  }, [farm, isAstroLp])

  const deposited = useMemo(() => {
    if (!isAstroLp) return BNCoin.fromDenomAndBigNumber('usd', depositedValue)
    const astroLpPosition = account.stakedAstroLps.find(
      (position) => position.denom === farm.denoms.lp,
    )
    if (!astroLpPosition) return BNCoin.fromDenomAndBigNumber(farm.denoms.lp, BN_ZERO)

    return astroLpPosition
  }, [account.stakedAstroLps, farm.denoms.lp, depositedValue, isAstroLp])

  const updatedDepositedValue = useMemo(() => {
    if (!isAstroLp) {
      const vault = updatedAccount?.vaults.find((v) => v.denoms.lp === farm.denoms.lp)
      if (!vault) return BN_ZERO
      return vault.values.primary.plus(vault.values.secondary).shiftedBy(-PRICE_ORACLE_DECIMALS)
    }

    const astroLpPosition = updatedAccount?.stakedAstroLps.find(
      (position) => position.denom === farm.denoms.lp,
    )
    if (!astroLpPosition) return BN_ZERO

    return astroLpPosition.amount
  }, [isAstroLp, updatedAccount?.stakedAstroLps, updatedAccount?.vaults, farm.denoms.lp])

  const campaignTypes =
    poolToken && poolToken.campaigns ? poolToken.campaigns.map((campaign) => campaign.type) : []

  const showCampaignHeader = poolToken && campaignTypes.includes('points_with_multiplier')

  return (
    <>
      <div className='flex gap-6 px-6 py-4 border-b border-white/5 bg-surface-dark'>
        <TitleAndSubCell
          title={
            <div className='flex flex-row'>
              <FormattedNumber amount={farm?.apy ?? 0} options={{ suffix: '%' }} />
              <FormattedNumber
                className='ml-2 text-xs'
                amount={(farm?.apy ?? 0) / 365}
                options={{ suffix: '%/day' }}
                parentheses
              />
            </div>
          }
          sub={'Deposit APY'}
        />
        <div className='h-100 w-px bg-surface-light' />
        {!deposited.amount.isZero() && (
          <>
            <TitleAndSubCell title={<DisplayCurrency coin={deposited} />} sub={'Deposited'} />
            <div className='h-100 w-px bg-surface-light' />
          </>
        )}
        {farm.cap && (
          <TitleAndSubCell
            title={
              <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber(farm.cap.denom, farm.cap.max)} />
            }
            sub={'Deposit Cap'}
          />
        )}
      </div>
      {showCampaignHeader &&
        poolToken.campaigns.map((campaign, index) => {
          if (campaign.type !== 'points_with_multiplier') return null
          return (
            <div
              className={classNames(
                'w-full p-2 flex items-center justify-center',
                campaign?.bgClassNames ?? 'bg-white/50',
              )}
              key={index}
            >
              <AssetCampaignCopy
                asset={poolToken}
                textClassName='text-white'
                size='sm'
                campaign={campaign}
                amount={updatedDepositedValue}
                withLogo
              />
            </div>
          )
        })}
    </>
  )
}
