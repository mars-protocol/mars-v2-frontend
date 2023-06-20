import { getAccountNftQueryClient } from 'api/cosmwasm-client'

export default async function getAccountIds(address: string): Promise<string[]> {
  const accountNftQueryClient = await getAccountNftQueryClient()

  const data = await accountNftQueryClient.tokens({ owner: address })

  if (data.tokens) {
    return data.tokens
  }

  return new Promise((_, reject) => reject('No data'))
}
