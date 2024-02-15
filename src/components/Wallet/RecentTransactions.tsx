import classNames from 'classnames'
import moment from 'moment'

import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'
import { generateToastContent } from 'components/common/Toaster'
import useTransactions from 'hooks/localStorage/useTransactions'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'

export default function RecentTransactions() {
  const address = useStore((s) => s.address)
  const [transactions, setTransactions] = useTransactions()
  const chainConfig = useChainConfig()
  const recentTransactions = transactions.recent
    .filter((tx) => tx.address === address)
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
  return (
    <div className='flex flex-col w-full gap-2 pb-4'>
      <Divider className='mb-2' />
      <Text size='sm' uppercase className='w-full text-center text-white/70'>
        Recent Transactions
      </Text>
      {recentTransactions.length === 0 ? (
        <Text size='sm' className='w-full pt-2 text-center text-white'>
          No recent transactions
        </Text>
      ) : (
        <>
          <div className='px-4 py-2 max-h-[400px] overflow-y-scroll scrollbar-hide'>
            <div className='flex flex-col w-full gap-2'>
              {recentTransactions.map((tx) => {
                const { accountId, hash, content, message, timestamp } = tx
                return (
                  <Card
                    className={classNames(
                      'gradient-card-content',
                      hash &&
                        'transitions-color duration-300 hover:cursor-pointer hover:bg-white/5',
                    )}
                    contentClassName='p-4'
                    onClick={() => {
                      if (hash) window.open(`${chainConfig.endpoints.explorer}${hash}`, '_blank')
                    }}
                    key={hash}
                  >
                    <div className='flex items-start justify-between w-full pb-2'>
                      <Text className='flex font-bold'>
                        {accountId === address ? 'Red Bank' : `Credit Account ${accountId}`}
                      </Text>
                      <Text size='sm' className='text-white/70'>
                        {moment.unix(timestamp).format('lll')}
                      </Text>
                    </div>
                    {message && (
                      <Text size='sm' className='w-full text-white'>
                        {message}
                      </Text>
                    )}
                    {content?.length > 0 && generateToastContent(content, chainConfig.assets)}
                  </Card>
                )
              })}
            </div>
          </div>
          <div className='w-full pr-4 text-right'>
            <TextLink
              onClick={() => {
                setTransactions({ recent: [] })
              }}
              className='underline text-white/70 hover:no-underline'
            >
              Clear all Transactions
            </TextLink>
          </div>
        </>
      )}
    </div>
  )
}
