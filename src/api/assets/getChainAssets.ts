import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import { mockedOsmosisAssetsResponseData } from 'mocks/osmosisAssetsResponseData'
import { ChainInfoID } from 'types/enums'
import { convertOsmosisAssetsResponse } from 'utils/assets'

export default async function getChainAssets(chainConfig: ChainConfig) {
  const whitelistedAssets = useAllWhitelistedAssets()
  if (!chainConfig.anyAsset) return chainConfig.assets

  if (chainConfig.id === ChainInfoID.Osmosis1) {
    const limitPerPage = 100
    const maxFetch = 300

    const searchParams = {
      json: {
        limit: limitPerPage,
        search: null,
        onlyVerified: true,
        includePreview: false,
        sort: null,
        watchListDenoms: [],
        categories: null,
        cursor: 0,
      },
      meta: { values: { search: ['undefined'], sort: ['undefined'], categories: ['undefined'] } },
    }
    const fetches = []
    for (let i = 0; i < maxFetch; i += limitPerPage) {
      searchParams.json.cursor = i
      const fetchURL = new URL(
        'https://app.osmosis.zone/api/edge-trpc-assets/assets.getMarketAssets',
      )
      fetchURL.searchParams.append('input', JSON.stringify(searchParams))
      fetches.push(fetch(fetchURL.toString()))
    }
    try {
      const assets = (await Promise.all(fetches).then((responses) =>
        responses.map(async (response) => {
          const data = (await response.json()) as OsmosisAssetsResponseData
          return convertOsmosisAssetsResponse(data, whitelistedAssets)
        }),
      )) as Asset[]
    } catch (e) {
      console.error(e)
    }
    const mockedAssets = convertOsmosisAssetsResponse(
      mockedOsmosisAssetsResponseData,
      whitelistedAssets,
    )
    // return [...whitelistedAssets, ...assets.flat()]
    return [...whitelistedAssets, ...mockedAssets]
  } else {
    return whitelistedAssets
  }
}
