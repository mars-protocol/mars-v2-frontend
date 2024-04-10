import useSWR from 'swr'

import useChainConfig from 'hooks/useChainConfig'

export default function useManagedVaultApy(address: string) {
  const chainConfig = useChainConfig()

  return useSWR(`chains/${chainConfig.id}/managed-vaults/${address}/apys`, async () => {
    const res = await fetch(
      `https://mars-wif-bots-5e8e.onrender.com/api/vaults/${address}/apy`,
    ).then((res) => res.json())

    return res.map((data: any) => ({ name: data.timestamp, value: data.apy.toFixed(2) }))
  })
}
