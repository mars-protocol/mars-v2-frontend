import request, { gql } from 'graphql-request'
import useSWRImmutable from 'swr/immutable'
import { convertToStargazeAddress } from 'utils/wallet'

export default function useStargazeWalletInfo(address?: string) {
  const stargazeAddress = convertToStargazeAddress(address)

  return useSWRImmutable(stargazeAddress && `wallet/stargaze-info/${stargazeAddress}`, async () => {
    return (await request(
      'https://graphql.mainnet.stargaze-apis.com/graphql',
      gql`
        query ProfileWallet {
          wallet(address: "${stargazeAddress}") {
            name {
              name
              associatedAddr
              media {
                url
                height
                width
                visualAssets {
                  lg {
                    url
                    height
                    width
                  }
                }
              }
              records {
                name
                value
                verified
              }
            }
          }
        }
      `,
    )) as StargazeNameInfo
  })
}
