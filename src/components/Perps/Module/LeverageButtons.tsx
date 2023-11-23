import Button from 'components/Button'

const LEVERAGE_PRESETS = [1, 2, 3, 5, 10]

export function LeverageButtons() {
  return (
    <div className='flex justify-between'>
      {LEVERAGE_PRESETS.map((leverage) => (
        <Button key={leverage} color='tertiary' className='w-12'>
          {leverage}x
        </Button>
      ))}
    </div>
  )
}
