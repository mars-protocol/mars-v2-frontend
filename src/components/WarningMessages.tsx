import Divider from 'components/Divider'
import { ExclamationMarkTriangle, InfoCircle } from 'components/Icons'
import Text from 'components/Text'
import { Tooltip } from 'components/Tooltip'

interface Props {
  messages: string[]
}

export default function WarningMessages(props: Props) {
  if (!props.messages.length) return null

  return (
    <div className='grid items-center pr-2 cursor-pointer'>
      <Tooltip
        content={
          <div className='p-2'>
            {props.messages.map((message, index) => (
              <div key={message}>
                <div className='grid grid-cols-[22px,auto] gap-2'>
                  <InfoCircle />
                  <div>
                    <Text size='sm'>{message}</Text>
                    {index !== props.messages.length - 1 && (
                      <Divider className='!bg-white/30 my-2' />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
        type='warning'
        interactive
      >
        <ExclamationMarkTriangle width={24} className='text-warning' />
      </Tooltip>
    </div>
  )
}
