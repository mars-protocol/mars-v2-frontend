import { useMemo } from 'react'

import usePerpsEnabledAssets from '../../../hooks/assets/usePerpsEnabledAssets'
import { byDenom } from '../../../utils/array'
import { getAssetAccountPerpRow } from './functions'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountPerpData(props: Props) {
  const { account, updatedAccount } = props
  const assets = usePerpsEnabledAssets()

  return useMemo<AccountPerpRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountPerps = usedAccount?.perps ?? []

    return accountPerps.map((perp) => {
      const asset = assets.find(byDenom(perp.denom)) ?? assets[0]
      const prevPerp = updatedAccount
        ? account?.perps?.find((position) => position.denom === perp.denom)
        : perp
      return getAssetAccountPerpRow(asset, perp, prevPerp)
    })
  }, [updatedAccount, account, assets])
}
