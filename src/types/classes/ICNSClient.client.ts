import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
export interface ICNSReadOnlyInterface {
  contractAddress: string
  primaryName: ({ address }: { address: string }) => Promise<ICNSResult>
}
export class ICNSQueryClient implements ICNSReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient) {
    this.client = client
    this.contractAddress = 'osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd'
    this.primaryName = this.primaryName.bind(this)
  }

  primaryName = async ({ address }: { address: string }): Promise<ICNSResult> => {
    return this.client.queryContractSmart(this.contractAddress, {
      icns_names: {
        address,
      },
    })
  }
}
