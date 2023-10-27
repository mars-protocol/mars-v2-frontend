import useSWR from 'swr'

import getAccount from 'api/accounts/getAccount'
import { AccountKind } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'

export default function useAccount(kind: AccountKind, accountId?: string, suspense?: boolean) {
  return useSWR(`account${accountId}`, () => getAccount({ id: accountId || '', kind }), {
    suspense: suspense,
    revalidateOnFocus: false,
  })
}
