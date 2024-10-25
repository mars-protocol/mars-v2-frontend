import Button from 'components/common/Button'
import EscButton from 'components/common/Button/EscButton'
import Divider from 'components/common/Divider'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import TextArea from 'components/common/TextArea'
import { useState } from 'react'

interface Props {
  showEditModal: boolean
  setShowEditModal: (show: boolean) => void
  description: string
  onUpdateDescription: (newDescription: string) => void
}

export default function EditDescription(props: Props) {
  const { showEditModal, setShowEditModal, description, onUpdateDescription } = props

  const [tempDescription, setTempDescription] = useState<string>(description)

  const handleSave = () => {
    onUpdateDescription(tempDescription)
    setShowEditModal(false)
  }

  return (
    <Overlay
      className='absolute top-[25%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col w-full md:w-140 h-[calc(100dvh-200px)] md:h-118 overflow-hidden'
      show={showEditModal}
      setShow={setShowEditModal}
    >
      <div className='gradient-description absolute h-full w-full opacity-30' />
      <div className='flex items-center justify-between p-4'>
        <Text>Edit Your Description</Text>
        <EscButton onClick={() => setShowEditModal(false)} enableKeyPress />
      </div>
      <Divider />
      <TextArea
        value={tempDescription}
        onChange={(e) => setTempDescription(e.target.value)}
        maxLength={240}
        placeholder='Enter a detailed description...'
        required
        className='w-full h-full text-white/60 !bg-transparent !border-none'
      />
      <div className='flex justify-end p-4'>
        <Button onClick={handleSave} variant='solid' size='md' className='w-32' text='Save' />
      </div>
    </Overlay>
  )
}
