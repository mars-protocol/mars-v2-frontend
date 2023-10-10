import useSWR from 'swr'

import getVaults from 'api/vaults/getVaults'

export default function useVaults(suspense: boolean = true, address?: string) {
  return useSWR(`vaults${address}`, () => getVaults(), {
    suspense,
    revalidateOnFocus: false,
  })
}
