const LEVERAGE_PRESETS = [1, 2, 3, 5, 10]

export function LeverageButtons() {
  return (
    <div className='flex justify-between'>
      {LEVERAGE_PRESETS.map((leverage) => (
        <button
          key={leverage}
          className='w-12 !border:none bg-white/10 rounded-sm py-1 text-xs hover:bg-white/20'
        >
          {leverage}x
        </button>
      ))}
    </div>
  )
}
