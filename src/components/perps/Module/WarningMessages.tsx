import { Callout, CalloutType } from 'components/common/Callout'

type WarningMessagesProps = {
  messages: string[]
}

export const WarningMessages = ({ messages }: WarningMessagesProps) => {
  return (
    <>
      {messages.map((message) => (
        <Callout key={message} type={CalloutType.WARNING}>
          {message}
        </Callout>
      ))}
    </>
  )
}
