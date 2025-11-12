import React from 'react'
import classNames from 'classnames'
import dayjs from 'utils/dayjs'
import Text from 'components/common/Text'

interface Props {
  active?: boolean
  payload: ChartDataPayloadProps[]
  label: string
  renderContent: (payload: ChartDataPayloadProps[]) => React.ReactNode
}

export default function CustomTooltip(props: Props) {
  const { active, payload, label, renderContent } = props

  const formatDateLabel = (label: string) => {
    const date = dayjs(label)
    return date.isValid() ? date.format('DD MMM YYYY') : label
  }

  if (active && payload && payload.length) {
    return (
      <div
        className={classNames(
          'max-w-80 rounded-lg px-4 py-2 isolate bg-black/5 backdrop-blur',
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
