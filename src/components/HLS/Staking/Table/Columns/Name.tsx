import React from 'react'

import DoubleLogo from 'components/DoubleLogo'
import Loading from 'components/Loading'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { getAssetByDenom } from 'utils/assets'

export const NAME_META = { id: 'name', header: 'Vault', accessorKey: 'denoms.deposit' }
interface Props {
  strategy: HLSStrategy
}

export default function Name(props: Props) {
  const { strategy } = props
  const depositAsset = getAssetByDenom(props.strategy.denoms.deposit)
  const borrowAsset = getAssetByDenom(props.strategy.denoms.borrow)

  return (
    <div className='flex'>
      <DoubleLogo primaryDenom={strategy.denoms.deposit} secondaryDenom={strategy.denoms.borrow} />
      {depositAsset && borrowAsset ? (
        <TitleAndSubCell
          className='ml-2 mr-2 text-left'
          title={`${depositAsset.symbol}/${borrowAsset.symbol}`}
          sub='Staking'
        />
      ) : (
        <Loading />
      )}
    </div>
  )
}
