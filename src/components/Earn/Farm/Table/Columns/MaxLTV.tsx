import React from 'react'

import Loading from 'components/Loading'
import Text from 'components/Text'
import { formatPercent } from 'utils/formatters'

interface Props {
  vault: Vault | DepositedVault
  isLoading: boolean
}
export default function MaxLtv(props: Props) {
  const { vault } = props
  if (props.isLoading) return <Loading />
  return <Text className='text-xs'>{formatPercent(vault.ltv.max)}</Text>
}
