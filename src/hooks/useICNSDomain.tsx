import useSWR from 'swr'

import getICNS from 'api/wallets/getICNS'

export default function useICNSDomain(address?: string) {
  return useSWR(`ICNS-${address}`, () => getICNS(address), {
    revalidateOnFocus: false,
  })
}
