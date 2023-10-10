import { cacheFn, previewDepositCache } from 'api/cache'
import { getVaultQueryClient } from 'api/cosmwasm-client'

export async function getVaultTokenFromLp(
  vaultAddress: string,
  lpAmount: string,
): Promise<{ vaultAddress: string; amount: string }> {
  try {
    const client = await getVaultQueryClient(vaultAddress)

    return cacheFn(
      () =>
        client.previewDeposit({ amount: lpAmount }).then((amount) => ({ vaultAddress, amount })),
      previewDepositCache,
      `vaults/${vaultAddress}/amounts/${lpAmount}`,
      30,
    )
  } catch (ex) {
    throw ex
  }
}
