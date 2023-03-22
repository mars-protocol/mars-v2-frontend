import classNames from 'classnames'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function Container(props: Props) {
  return (
    <section
      className={classNames(
        props.className,
        'relative flex-col flex-wrap items-start rounded-base border border-transparent bg-white/5 p-4',
        'before:content-[" "] before:absolute before:inset-0 before:z-[-1] before:rounded-base before:p-[1px] before:border-glas',
      )}
    >
      {props.children}
    </section>
  )
}
