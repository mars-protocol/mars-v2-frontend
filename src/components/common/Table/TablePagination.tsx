import classNames from 'classnames'
import Button from 'components/common/Button'
import { ChevronLeft, ChevronRight } from 'components/common/Icons'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}: Props) {
  return (
    <div className={classNames('border-t border-white/10', className)}>
      <div className='flex items-center justify-between px-4 py-2 bg-black/20'>
        <div className='flex items-center gap-4 ml-auto'>
          <span className='text-xs text-white/60'>
            {currentPage} of {totalPages}
          </span>
          <div className='flex gap-2'>
            <Button
              color='tertiary'
              variant='transparent'
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              rightIcon={<ChevronLeft />}
              iconClassName='h-2 w-2'
            />
            <Button
              color='tertiary'
              variant='transparent'
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              rightIcon={<ChevronRight />}
              iconClassName='h-2 w-2'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
