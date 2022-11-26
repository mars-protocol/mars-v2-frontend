import { useState } from 'react'

import Button from 'components/Button'
import Card from 'components/Card'
import Modal from 'components/Modal'
import Number from 'components/Number'
import Overlay from 'components/Overlay'
import Text from 'components/Text'

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
  const [show, setShow] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(true)
  return (
    <div className='flex flex-col gap-4'>
      <Card className='flex-1'>
        <span onClick={() => setShow(!show)} role='button'>
          Portfolio Module
        </span>
        <Overlay show={show} setShow={setShow}>
          A test overlay
        </Overlay>
      </Card>
      <div className='grid grid-cols-2 gap-4'>
        {mockedAccounts.map((account) => (
          <Card key={account.id}>
            <Text size='lg' uppercase={true} className='mb-4 text-center'>
              {account.label}
            </Text>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Text>
                  <Number amount={account.networth} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Net worth
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.totalPositionValue} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Total Position Value
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.debt} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Debt
                </Text>
              </div>
              <div>
                <Text className={account.profit > 0 ? 'text-green-400' : 'text-red-500'}>
                  <Number
                    amount={account.debt}
                    animate={true}
                    prefix={account.profit > 0 ? '+$' : '$'}
                  />
                </Text>
                <Text size='sm' className='text-white/40'>
                  P&L
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.leverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Current Leverage
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.maxLeverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Max Leverage
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className='w-full'>
        <Button
          onClick={() => {
            setOpen(!open)
          }}
          text='Toggle Modal'
        />
      </div>
      <Modal open={open} setOpen={setOpen}>
        {mockedAccounts.map((account) => (
          <div key={account.id} className='mb-8'>
            <Text size='lg' uppercase={true} className='mb-4 px-10 text-center'>
              {account.label}
            </Text>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Text>
                  <Number amount={account.networth} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Net worth
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.totalPositionValue} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Total Position Value
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.debt} animate={true} prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Debt
                </Text>
              </div>
              <div>
                <Text className={account.profit > 0 ? 'text-green-400' : 'text-red-500'}>
                  <Number
                    amount={account.debt}
                    animate={true}
                    prefix={account.profit > 0 ? '+$' : '$'}
                  />
                </Text>
                <Text size='sm' className='text-white/40'>
                  P&L
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.leverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Current Leverage
                </Text>
              </div>
              <div>
                <Text>
                  <Number amount={account.maxLeverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Max Leverage
                </Text>
              </div>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  )
}

export default Portfolio
