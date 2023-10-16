import useSWR from 'swr'

import getHLSVaults from 'api/hls/getHLSVaults'

export default function useHLSVaults() {
  return useSWR('hls-vaults', getHLSVaults, {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
