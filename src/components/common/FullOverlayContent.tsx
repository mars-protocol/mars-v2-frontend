import classNames from 'classnames'

import Button from 'components/common/Button'
import DocsLink from 'components/common/DocsLink'
import Text from 'components/common/Text'
import TextInput from 'components/common/TextInput'

interface TextProps {
  text: string
  className?: string
  onChange: (text: string) => void
  placeholder: string
}

interface Props {
  title: string
  copy: string
  className?: string
  children?: React.ReactNode
  select?: [ButtonProps, ButtonProps]
  text?: TextProps[] | undefined
  button?: ButtonProps
  docs?: DocLinkType
}

export default function FullOverlayContent(props: Props) {
  return (
    <div
      className={classNames(
        'h-screen-full md:min-h-[600px] w-screen-full md:w-100 max-w-full',
        props.className,
      )}
    >
      <Text size='4xl' className='w-full pb-2 text-center'>
        {props.title}
      </Text>
      <Text size='sm' className='w-full text-center min-h-14 text-white/60'>
        {props.copy}
      </Text>
      {props.children && (
        <div className='relative flex flex-wrap justify-center w-full pt-4'>{props.children}</div>
      )}
      {props.select && (
        <div className='flex justify-center w-full'>
          <Button {...props.select[0]} />
          <Button {...props.select[1]} />
        </div>
      )}
      {props.text && (
        <div>
          {[0, 1, 2, 3].map((_, i) => (
            <div
              key={i}
              className='flex flex-1 flex-row py-3 border-[1px] border-white/20 rounded bg-white/5 pl-3 pr-2 mt-2'
            >
              <TextInput {...props.text![i]} />
            </div>
          ))}
        </div>
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
