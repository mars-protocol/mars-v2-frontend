import classNames from 'classnames'
import { CircularProgress } from 'components/common/CircularProgress'
import { useState } from 'react'

interface Props {
  denom: string
}

export function PerpsStats({ denom }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  const handleIframeLoad = () => {
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className='flex gap-4 h-[500px] md:h-screen/70 md:max-h-[980px] md:min-h-[560px] w-full items-center justify-center'>
      {isLoading && <CircularProgress size={60} />}
      <iframe
        src={`https://stats.marsprotocol.io/${denom}?iframeView=on`}
        className={classNames(
          'w-[calc(100%-2px)] ml-[1px] h-full border-0',
          isLoading ? 'hidden' : 'flex',
        )}
        title='Perps Stats'
        onLoad={handleIframeLoad}
      />
    </div>
  )
}
