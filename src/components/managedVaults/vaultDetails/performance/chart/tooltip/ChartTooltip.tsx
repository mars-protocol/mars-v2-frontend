import React from 'react'
import classNames from 'classnames'
import moment from 'moment'
import Text from 'components/common/Text'

interface Props {
  active?: boolean
  payload: any[]
  label: string
  renderContent: (payload: any[]) => React.ReactNode
}

export default function CustomTooltip(props: Props) {
  const { active, payload, label, renderContent } = props

  const formatDateLabel = (label: string) => {
    const date = moment(label)
    return date.isValid() ? date.format('DD MMM YYYY') : label
  }

  if (active && payload && payload.length) {
    return (
      <div
        className={classNames(
          'max-w-[320px] rounded-lg px-4 py-2 isolate bg-black/5 backdrop-blur',
          'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
        )}
      >
        <Text size='sm' className='text-white/60'>
          {formatDateLabel(label)}
        </Text>
        {renderContent(payload)}
      </div>
    )
  }

  return null
}
