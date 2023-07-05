import { Enter } from 'components/Icons'

export function NoIcon() {
  return (
    <div className='ml-1 flex items-center rounded-xs border-[1px] border-white/5 bg-white/5 px-1 py-0.5 text-[8px] font-bold leading-[10px] text-white/60 '>
      ESC
    </div>
  )
}

export function YesIcon() {
  return (
    <div className='ml-1 rounded-xs border-[1px] border-white/5 bg-white/5 px-1 py-0.5'>
      <Enter width={12} />
    </div>
  )
}
