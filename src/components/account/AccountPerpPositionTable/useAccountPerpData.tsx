import { useMemo } from 'react'

import { getAssetAccountPerpRow } from 'components/account/AccountPerpPositionTable/functions'
import useAllAssets from 'hooks/assets/useAllAssets'
import usePrices from 'hooks/usePrices'
import { byDenom } from 'utils/array'

interface Props {
  account: Account
  updatedAccount?: Account
}

export default function useAccountPerpData(props: Props) {
  const { account, updatedAccount } = props
  const { data: prices } = usePrices()
  const assets = useAllAssets()

  return useMemo<AccountPerpRow[]>(() => {
    const usedAccount = updatedAccount ?? account
    const accountPerps = usedAccount?.perps ?? []

    const perps = accountPerps.map((perp) => {
      const asset = assets.find(byDenom(perp.denom)) ?? assets[0]
      const prevPerp = updatedAccount
        ? account?.perps.find((position) => position.denom === perp.denom)
        : perp
      return getAssetAccountPerpRow(asset, prices, perp, assets, prevPerp)
    })

    return [...perps]
  }, [updatedAccount, account, prices, assets])
}
