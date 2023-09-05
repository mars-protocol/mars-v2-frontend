import BorrowIntro from 'components/Borrow/BorrowIntro'
import BorrowTable from 'components/Borrow/BorrowTable'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'

export default function BorrowPage() {
  const { accountBorrowedAssets, availableAssets } = useBorrowMarketAssetsTableData()

  return (
    <>
      <BorrowIntro />
      <BorrowTable data={accountBorrowedAssets} title='Borrowed Assets' />
      <BorrowTable data={availableAssets} title='Available to borrow' />
    </>
  )
}
