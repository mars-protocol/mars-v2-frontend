import classNames from 'classnames'

import Button from 'components/Button'
import DocsLink from 'components/DocsLink'
import Text from 'components/Text'

interface Props {
  title: string
  copy: string
  className?: string
  children?: React.ReactNode
  button?: ButtonProps
  docs?: DocLinkType
}

export default function FullOverlayContent(props: Props) {
  return (
    <div className={classNames('min-h-[600px] w-100 max-w-full', props.className)}>
      <Text size='4xl' className='w-full pb-2 text-center'>
        {props.title}
      </Text>
      <Text size='sm' className='w-full text-center min-h-14 text-white/60'>
        {props.copy}
      </Text>
      {props.children && (
        <div className='relative flex flex-wrap justify-center w-full pt-4'>{props.children}</div>
      )}
      {props.button && (
        <div className='flex justify-center w-full'>
          <Button {...props.button} />
        </div>
      )}
      {props.docs && <DocsLink type={props.docs} />}
    </div>
  )
}
