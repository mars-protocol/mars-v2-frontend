import { Search } from 'components/Icons'
export const SearchInput = () => (
  <div className='relative mt-[1px] py-2 text-white'>
    <span className='absolute top-1/2 left-0 flex h-6 w-8 -translate-y-1/2 items-center pl-2'>
      <Search />
    </span>
    <input
      className='w-[280px] rounded-md border border-white/20 bg-black/30 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none'
      placeholder='Search'
    />
  </div>
)
