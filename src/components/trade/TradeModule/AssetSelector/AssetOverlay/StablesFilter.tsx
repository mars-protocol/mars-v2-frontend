import Button from 'components/common/Button'
import Divider from 'components/common/Divider'

interface StablesFilterProps {
  onFilter: (stables: Asset[]) => void
  selectedStables: Asset[]
  stables: Asset[]
}

export default function StablesFilter(props: StablesFilterProps) {
  const { stables, selectedStables, onFilter } = props
  const isAllSelected = selectedStables.length > 1
  return (
    <>
      <Divider />
      <div className='flex items-center w-full gap-2 p-2'>
        {stables.map((stable) => {
          const isCurrent = !isAllSelected && selectedStables[0].denom === stable.denom
          return (
            <Button
              key={stable.symbol}
              onClick={() => onFilter([stable])}
              text={stable.symbol}
              color={isCurrent ? 'secondary' : 'quaternary'}
              variant='transparent'
              className={isCurrent ? 'text-white! border-white' : ''}
            />
          )
        })}
      </div>
    </>
  )
}
