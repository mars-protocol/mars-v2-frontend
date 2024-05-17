import { useMemo } from 'react'

import { getAssetAccountPerpRow } from 'components/account/AccountPerpPositionTable/functions'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountPerpData(props: Props) {
  const { account, updatedAccount } = props
  const assets = useAllWhitelistedAssets()

  return useMemo<AccountPerpRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountPerps = usedAccount?.perps ?? []

    return accountPerps.map((perp) => {
      const asset = assets.find(byDenom(perp.denom)) ?? assets[0]
      const prevPerp = updatedAccount
        ? account?.perps.find((position) => position.denom === perp.denom)
        : perp
      return getAssetAccountPerpRow(asset, perp, prevPerp)
    })
  }, [updatedAccount, account, assets])
}
