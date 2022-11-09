import React from 'react'

import Card from 'components/Card'
import { formatCurrency } from 'utils/formatters'

const mockedAccounts = [
  {
    id: 1,
    label: 'Subaccount 1',
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 2,
    label: 'Subaccount 2',
    networth: 33000,
    totalPositionValue: 11000,
    debt: 20000,
    profit: -11366,
    leverage: 2,
    maxLeverage: 10,
  },
  {
    id: 3,
    label: 'Subaccount 3',
    networth: 0,
    totalPositionValue: 12938129,
    debt: 9999999999,
    profit: -99999999,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 4,
    label: 'Subaccount 4',
    networth: 33653.22,
    totalPositionValue: 100000,
    debt: 50001.9,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
]

const Portfolio = () => {
  return (
    <div className='flex flex-col gap-4'>
      <Card className='flex-1'>Portfolio Module</Card>
      <div className='grid grid-cols-2 gap-4'>
        {mockedAccounts.map((account) => (
          <Card key={account.id}>
            <p className='mb-4 font-bold text-center'>{account.label}</p>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <p>{formatCurrency(account.networth)}</p>
                <p className='text-sm text-white/40'>Net worth</p>
              </div>
              <div>
                <p>{formatCurrency(account.totalPositionValue)}</p>
                <p className='text-sm text-white/40'>Total Position Value</p>
              </div>
              <div>
                <p>{formatCurrency(account.debt)}</p>
                <p className='text-sm text-white/40'>Debt</p>
              </div>
              <div>
                <p className={`${account.profit > 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {account.profit > 0 && '+'}
                  {formatCurrency(account.profit)}
                </p>
                <p className='text-sm text-white/40'>P&L</p>
              </div>
              <div>
                <p>{account.leverage}</p>
                <p className='text-sm text-white/40'>Current Leverage</p>
              </div>
              <div>
                <p>{account.maxLeverage}</p>
                <p className='text-sm text-white/40'>Max Leverage</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
