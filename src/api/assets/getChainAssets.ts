import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import { mockedOsmosisAssetsResponseData } from 'mocks/osmosisAssetsResponseData'
import { ChainInfoID } from 'types/enums'
import { convertAstroportAssetsResponse, convertOsmosisAssetsResponse } from 'utils/assets'

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
      const fetchURL = new URL(chainConfig.endpoints.anyAsset)
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
  }

  if (chainConfig.id === ChainInfoID.Pion1 || chainConfig.id === ChainInfoID.Neutron1) {
    const searchParams = { json: { chainId: chainConfig.id } }
    const uri = new URL(chainConfig.endpoints.anyAsset)
    uri.searchParams.append('input', JSON.stringify(searchParams))
    try {
      const assets = await fetch(uri.toString()).then(async (res) => {
        const data = (await res.json()) as AstroportAssetsResponseData
        return convertAstroportAssetsResponse(data, whitelistedAssets)
      })
      return [...whitelistedAssets, ...assets]
    } catch (e) {
      console.error(e)
    }

    return whitelistedAssets
  }

  return whitelistedAssets
}
