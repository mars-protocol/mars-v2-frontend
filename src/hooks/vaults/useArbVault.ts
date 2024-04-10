import useSWR from 'swr'

import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useManagedVaults from './useManagedVaults'

import useChainConfig from '../useChainConfig'

export default function useArbVault() {
  const chainConfig = useChainConfig()
  const { data: managedVaults } = useManagedVaults()

  return useSWR(
    !!managedVaults?.length && `chains/${chainConfig.id}/managed-vaults/info`,
    async () => {
      if (!managedVaults?.length) return null

      const apys = await Promise.all(
        managedVaults.map((vault) =>
          fetch(`https://mars-wif-bots-5e8e.onrender.com/api/vaults/${vault.vault_addr}/apy`).then(
            (res) => res.json().then((data) => data[0]?.apy as number),
          ),
        ),
      )

      return managedVaults
        .map((vault, index) => {
          return {
            address: vault.vault_addr,
            accountId: vault.account_id,
            apy: apys[index],
            vaultTokenSupply: BN(vault.vault_token_supply),
            tvl: BNCoin.fromDenomAndBigNumber(vault.base_token, BN(vault.total_assets)),
            baseDenom: vault.base_token,
            vaultDenom: vault.vault_token,
            title: vault.title,
            subtitle: vault.subtitle,
            description: vault.description,
          } as ManagedVault
        })
        .sort((a, b) => -a.tvl.amount.minus(b.tvl.amount).toNumber())
    },
  )
}
