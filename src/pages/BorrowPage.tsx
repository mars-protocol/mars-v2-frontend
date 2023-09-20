import BorrowIntro from 'components/Borrow/BorrowIntro'
import BorrowTable from 'components/Borrow/BorrowTable'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'

export default function BorrowPage() {
  const { accountBorrowedAssets, availableAssets } = useBorrowMarketAssetsTableData()

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <BorrowIntro />
      <BorrowTable data={accountBorrowedAssets} title='Borrowed Assets' />
      <BorrowTable data={availableAssets} title='Available to borrow' />
    </div>
  )
}
