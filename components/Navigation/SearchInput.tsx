const SearchInput = () => (
  <div className='relative text-white'>
    <span className='absolute inset-y-0 left-0 flex items-center pl-2'>
      <svg
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        viewBox='0 0 24 24'
        className='h-6 w-6'
      >
        <path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path>
      </svg>
    </span>
    <input
      className='rounded-md bg-black/70 py-2 pl-10 text-sm text-white focus:outline-none'
      placeholder='Search'
    />
  </div>
)

export default SearchInput
