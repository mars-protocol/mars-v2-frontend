interface Props {
  orientation?: 'horizontal' | 'vertical'
}

export default function Divider(props: Props) {
  if (props.orientation === 'vertical') {
    return <div className='h-full w-[1px] bg-white/10'></div>
  }
  return <div className='h-[1px] w-full bg-white/10'></div>
}
