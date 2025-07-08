import Divider from 'components/common/Divider'
import { ExclamationMarkTriangle, InfoCircle } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import React from 'react'

interface Props {
  messages: string[]
}

export default function WarningMessages(props: Props) {
  if (!props.messages.length) return null

  return (
    <div className='flex items-center pr-2 cursor-pointer'>
      <Tooltip
        content={
          <div className='flex flex-col gap-2'>
            {props.messages.map((message, index) => (
              <React.Fragment key={message}>
                <div className='flex items-center gap-1'>
                  <span className='h-4 w-4'>
                    <InfoCircle />
                  </span>
                  <Text size='xs'>{message}</Text>
                </div>
                {index !== props.messages.length - 1 && <Divider className='!bg-white/30 my-1' />}
              </React.Fragment>
            ))}
          </div>
        }
        type='warning'
        interactive
      >
        <div className='w-6'>
          <ExclamationMarkTriangle className='text-warning' />
        </div>
      </Tooltip>
    </div>
  )
}
