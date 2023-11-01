import useVaults from 'hooks/useVaults'

export default function useVault(address: string) {
  const { data: vaults } = useVaults(false)

  if (!vaults?.length) return null

  return vaults.find((v) => v.address === address) ?? null
}
