import { getVaultQueryClient } from 'api/cosmwasm-client'

export async function getVaultTokenFromLp(
  vaultAddress: string,
  lpAmount: string,
): Promise<{ vaultAddress: string; amount: string }> {
  try {
    const client = await getVaultQueryClient(vaultAddress)

    return client.previewDeposit({ amount: lpAmount }).then((amount) => ({ vaultAddress, amount }))
  } catch (ex) {
    throw ex
  }
}
