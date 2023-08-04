import useSWR from 'swr'

import getAssetParams from 'api/params/getAssetParams'

export default function useAssetParams() {
  return useSWR('assetParams', getAssetParams, {
    fallbackData: [],
    revalidateOnFocus: false,
  })
}
