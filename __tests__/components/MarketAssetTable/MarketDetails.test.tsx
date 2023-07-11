import { render } from '@testing-library/react'

import LendingDetails from 'components/MarketAssetTable/MarketDetails'
import { ASSETS } from 'constants/assets'
import { BN } from 'utils/helpers'

const data: LendingMarketTableData = {
  asset: ASSETS[0],
  marketDepositAmount: BN('890546916'),
  accountLentValue: BN('0.5498406009348686811'),
  marketLiquidityAmount: BN('629396551'),
  marketDepositCap: BN('2500000000000'),
  marketLiquidityRate: 0.017,
  marketLiquidationThreshold: 0.61,
  marketMaxLtv: 0.59,
}

jest.mock('hooks/useDisplayCurrencyPrice', () => () => {
  const { BN } = require('utils/helpers')

  return {
    getConversionRate: () => BN(1),
    convertAmount: () => BN(1),
    symbol: 'MARS',
  }
})

describe('<LendingDetails />', () => {
  afterAll(() => {
    jest.unmock('hooks/usePrices')
  })

  it('should render', () => {
    const { container } = render(<LendingDetails data={data} />)
    expect(container).toBeInTheDocument()
  })
})
