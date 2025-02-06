import classNames from 'classnames'
import { useLocation, useParams } from 'react-router-dom'
import useClipboard from 'react-use-clipboard'

import Button from 'components/common/Button'
import { Chain, Check, Twitter } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import { DocURL } from 'types/enums'

interface Props {
  text: string
}

export default function ShareBar(props: Props) {
  const { address } = useParams()
  const { pathname } = useLocation()
  const currentUrl = `https://${location.host}${pathname}`
  const [isCopied, setCopied] = useClipboard(currentUrl, {
    successDuration: 1000 * 5,
  })

  if (!window || !address) return null
  return (
    <div className='flex justify-end gap-2 flex-grow'>
      <ConditionalWrapper
        condition={isCopied}
        wrapper={(children) => (
          <Tooltip type='info' content={<Text size='2xs'>Link copied!</Text>}>
            {children}
          </Tooltip>
        )}
      >
        <Button
          color='secondary'
          iconClassName='w-4 h-4'
          className={classNames('!p-2', isCopied && '!bg-transparent')}
          leftIcon={isCopied ? <Check /> : <Chain />}
          onClick={setCopied}
        />
      </ConditionalWrapper>
      <Button
        color='secondary'
        iconClassName='w-4 h-4'
        className='!p-2'
        leftIcon={<Twitter />}
        onClick={(e) => {
          e.preventDefault()
          window.open(`${DocURL.X_SHARE_URL}?text=${props.text} ${currentUrl}`, '_blank')
        }}
      />
    </div>
  )
}
