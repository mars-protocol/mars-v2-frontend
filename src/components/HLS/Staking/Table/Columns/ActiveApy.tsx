import { Row } from '@tanstack/react-table'
import React from 'react'

import TitleAndSubCell from 'components/TitleAndSubCell'

export const ACTIVE_APY_META = { header: 'APY', accessorKey: 'strategy' }

export const activeApySortingFn = (
  a: Row<HLSAccountWithStrategy>,
  b: Row<HLSAccountWithStrategy>,
): number => {
  // TODO: Properly implement this
  return 0
}

interface Props {
  account: HLSAccountWithStrategy
}

export default function ActiveAPY(props: Props) {
  return <TitleAndSubCell title={'-'} sub={'-%/day'} />
}
