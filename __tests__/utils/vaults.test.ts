import { getVaultMetaData } from 'utils/vaults'
import * as constants from 'constants/env'

jest.mock('constants/env', () => ({
  __esModule: true,
  get IS_TESTNET() {
    return true
  },
}))

describe('getVaultMetaData()', () => {
  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('returns the MAINNET vault of given address WHEN environment configured to mainnet', () => {
    jest.spyOn(constants, 'IS_TESTNET', 'get').mockReturnValue(false)

    const testAddress = 'osmo1g3kmqpp8608szfp0pdag3r6z85npph7wmccat8lgl3mp407kv73qlj7qwp'
    const testVaultName = 'OSMO-ATOM'

    expect(getVaultMetaData(testAddress)?.name).toBe(testVaultName)
  })

  it('returns the TESTNET vault of given address WHEN environment configured to testnet', () => {
    jest.spyOn(constants, 'IS_TESTNET', 'get').mockReturnValue(true)

    const testAddress = 'osmo1q40xvrzpldwq5he4ftsf7zm2jf80tj373qaven38yqrvhex8r9rs8n94kv'
    const testVaultName = 'OSMO-USDC.n'

    expect(getVaultMetaData(testAddress)?.name).toBe(testVaultName)
  })
})
