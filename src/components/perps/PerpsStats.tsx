import { CircularProgress } from 'components/common/CircularProgress'
import { useState } from 'react'

interface Props {
  denom: string
}

export function PerpsStats({ denom }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className='flex flex-col gap-4 h-full'>
      {isLoading && (
        <div className='flex items-center justify-center w-full h-full'>
          <CircularProgress size={60} />
        </div>
      )}
      <iframe
        src={`http://stats.marsprotocol.io/${denom}?iframeView=on`}
        className='w-[calc(100%-2px)] ml-[1px] h-screen max-h-[500px] border-0'
        title='Perps Stats'
        onLoad={handleIframeLoad}
      />
    </div>
  )
}
