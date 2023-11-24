import React, { useMemo } from 'react'

import Card from 'components/Card'
import Divider from 'components/Divider'
import Text from 'components/Text'

export function PerpsInfo() {
  const items = useMemo(
    () => [
      <Text key='item1'>$6,735</Text>,
      <InfoItem key='item2' label='Label' item={<Text size='sm'>Value</Text>} />,
      <InfoItem key='item3' label='Label' item={<Text size='sm'>Value</Text>} />,
      <InfoItem key='item4' label='Label' item={<Text size='sm'>Value</Text>} />,
      <InfoItem key='item5' label='Label' item={<Text size='sm'>Value</Text>} />,
    ],
    [],
  )

  return (
    <Card contentClassName='bg-white/10 py-3.5 px-4'>
      <div className='flex gap-4 items-center'>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item}
            {index !== items.length - 1 && <Divider orientation='vertical' className='h-9' />}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

interface InfoItemProps {
  item: React.ReactNode
  label: string
}

function InfoItem(props: InfoItemProps) {
  return (
    <div className='flex flex-col gap-1'>
      <Text size='xs' className='text-white/40'>
        {props.label}
      </Text>
      {props.item}
    </div>
  )
}
