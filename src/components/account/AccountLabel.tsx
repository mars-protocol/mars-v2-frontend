import { useState, useCallback, useEffect } from 'react'
import { Edit, Check } from 'components/common/Icons'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import useAccountLabels from 'hooks/localStorage/useAccountLabels'

interface Props {
  accountId: string
  className?: string
}

export default function AccountLabel({ accountId, className }: Props) {
  const [accountLabels, setAccountLabels] = useAccountLabels()
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(accountLabels[accountId] || '')

  useEffect(() => {
    setIsEditing(false)
    setLabel(accountLabels[accountId] || '')
  }, [accountId, accountLabels])

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setAccountLabels({ ...accountLabels, [accountId]: label.trim() })
      setIsEditing(false)
    },
    [accountId, label, accountLabels, setAccountLabels],
  )

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }, [])

  if (isEditing) {
    return (
      <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
        <input
          type='text'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='Enter account label'
          className='px-2 py-1 text-sm bg-white/5 rounded-base border border-white/10 focus:border-white/20 outline-none'
          autoFocus
        />
        <Button
          color='secondary'
          size='xs'
          onClick={handleSave}
          leftIcon={<Check />}
          className='!p-1'
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className='relative group/label'>
        <Text size='xs'>{accountLabels[accountId] || `Credit Account ${accountId}`}</Text>
        {accountLabels[accountId] && (
          <Text
            size='xs'
            className='absolute left-1/2 -translate-x-1/2 -bottom-7 opacity-0 group-hover/label:opacity-100 transition-opacity bg-[#1C1A2D] px-2 py-1 rounded-base whitespace-nowrap'
          >
            Credit Account {accountId}
          </Text>
        )}
      </div>
      <Button
        color='secondary'
        size='xs'
        onClick={handleEditClick}
        leftIcon={<Edit />}
        className='!p-1 opacity-50 hover:opacity-100'
      />
    </div>
  )
}
