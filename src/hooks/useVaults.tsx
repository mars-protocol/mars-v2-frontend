import useSWR from 'swr'

import getVaults from 'api/vaults/getVaults'

export default function useVaults(address?: string) {
  return useSWR(`vaults${address}`, () => getVaults(), {
    suspense: true,
    revalidateOnFocus: false,
  })
}
