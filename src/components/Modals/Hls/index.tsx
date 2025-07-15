import classNames from 'classnames'
import AssetCampaignCopy from 'components/common/assets/AssetCampaignCopy'
import Content from 'components/Modals/Hls/Deposit'
import Header from 'components/Modals/Hls/Header'
import Modal from 'components/Modals/Modal'
import { EMPTY_ACCOUNT_HLS } from 'constants/accounts'
import { BN_ONE, BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useMarket from 'hooks/markets/useMarket'
import { useCallback, useMemo } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinAmount, getCoinValue } from 'utils/formatters'

export default function HlsModalController() {
  const modal = useStore((s) => s.hlsModal)
  const { data: assets } = useAssets()

  const primaryAsset = assets.find(
    byDenom(modal?.vault?.denoms.primary || modal?.strategy?.denoms.deposit || ''),
  )

  const secondaryAsset = useMarket(modal?.strategy?.denoms.borrow || '')

  if (!primaryAsset || !secondaryAsset) return null

  if (modal?.vault)
    return (
      <HlsModal
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        vaultAddress={modal.vault.address}
      />
    )
  if (modal?.strategy)
    return (
      <HlsModal
        primaryAsset={primaryAsset}
        secondaryAsset={secondaryAsset}
        strategy={modal.strategy}
        vaultAddress={null}
      />
    )

  return null
}

interface Props {
  primaryAsset: Asset
  secondaryAsset: Market
  strategy?: HlsStrategy
  vaultAddress: string | null
}

function HlsModal(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  const showCampaignHeader =
    props.primaryAsset.campaigns.filter((campaign) => campaign.type === 'points_with_multiplier')
      .length > 0
  const primaryAssetAmount =
    updatedAccount?.deposits.find(byDenom(props.primaryAsset.denom))?.amount ?? BN_ZERO

  const hlsBorrowAmount = useStore((s) => s.hlsBorrowAmount)

  const fakeAccount = useMemo(() => {
    const borrowAmountValue = getCoinValue(
      BNCoin.fromDenomAndBigNumber(props.secondaryAsset.asset.denom, hlsBorrowAmount ?? BN_ZERO),
      [props.secondaryAsset.asset],
    )
    const convertedBorrowAmount = getCoinAmount(props.primaryAsset.denom, borrowAmountValue, [
      props.primaryAsset,
    ])

    const hasDebt = hlsBorrowAmount && !hlsBorrowAmount.isZero()
    return {
      ...EMPTY_ACCOUNT_HLS,
      deposits: [
        BNCoin.fromDenomAndBigNumber(
          props.primaryAsset.denom,
          primaryAssetAmount.plus(convertedBorrowAmount ?? BN_ZERO),
        ),
      ],
      debts: hasDebt ? [BNCoin.fromDenomAndBigNumber(props.primaryAsset.denom, BN_ONE)] : [],
    }
  }, [hlsBorrowAmount, primaryAssetAmount, props.primaryAsset, props.secondaryAsset.asset])

  const handleClose = useCallback(() => {
    useStore.setState({ hlsModal: null })
  }, [])

  return (
    <Modal
      header={
        <>
          <Header
            primaryAsset={props.primaryAsset}
            secondaryAsset={props.secondaryAsset.asset}
            className='pl-2 pr-2.5 py-3'
          />
          {showCampaignHeader &&
            props.primaryAsset.campaigns.map((campaign, index) => {
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
                    asset={props.primaryAsset}
                    textClassName='text-white'
                    size='sm'
                    campaign={campaign}
                    amount={fakeAccount.deposits[0].amount}
                    account={fakeAccount}
                    withLogo
                  />
                </div>
              )
            })}
        </>
      }
      headerClassName='gradient-header border-b-white/5 border-b flex-wrap'
      contentClassName='flex flex-col p-2 md:p-6 h-screen-full max-h-[546px] md:h-auto overflow-y-scroll scrollbar-hide'
      modalClassName='max-w-screen-full md:max-w-modal-lg '
      onClose={handleClose}
    >
      <Content
        collateralAsset={props.primaryAsset}
        borrowMarket={props.secondaryAsset}
        vaultAddress={props.vaultAddress}
        strategy={props.strategy}
      />
    </Modal>
  )
}
