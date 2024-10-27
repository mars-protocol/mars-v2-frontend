import Button from 'components/common/Button'
import Card from 'components/common/Card'
import Divider from 'components/common/Divider'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import { ArrowRight } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'

interface Props {
  showActionModal: boolean
  setShowActionModal: (show: boolean) => void
  type: 'deposit' | 'withdraw'
}

export default function VaultAction(props: Props) {
  const { showActionModal, setShowActionModal, type } = props

  const whitelistedAssets = useWhitelistedAssets()

  const isDeposit = type === 'deposit'

  return (
    <Overlay
      setShow={setShowActionModal}
      show={showActionModal}
      className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-140 h-auto overflow-hidden !bg-body'
    >
      <div className='flex items-center justify-between gradient-header py-2.5 px-4'>
        <Text size='lg'>{isDeposit ? 'Deposit' : 'Withdraw'}</Text>
        <EscButton onClick={() => setShowActionModal(false)} enableKeyPress />
      </div>

      <Divider />

      <div className='p-2 md:p-6 mb-4 w-full h-full max-w-screen-full'>
        <Card className='p-4 bg-white/5' contentClassName='flex flex-col justify-between gap-4'>
          {/* TODO: fetch */}
          <TokenInputWithSlider
            asset={whitelistedAssets[12]}
            onChange={() => {}}
            amount={BN(10000000)}
            max={BN(20000000)}
            className='w-full'
            maxText={isDeposit ? 'In Wallet' : 'Available to Withdraw'}
            warningMessages={[]}
          />

          <div className='space-y-2'>
            <Callout type={CalloutType.INFO}>
              {/* fetch withdrawal time freeze */}
              {isDeposit
                ? 'Please note that deposited funds come directly from your wallet. Your credit account will not be affected.'
                : 'Once you initiate this withdrawal, it will take 24 hours to become available.'}
            </Callout>
            {isDeposit && (
              <Callout type={CalloutType.INFO}>
                Please note there is a 24h withdrawal freeze.
              </Callout>
            )}
          </div>

          <Button
            onClick={() => {}}
            className='w-full'
            text={isDeposit ? 'Deposit' : 'Withdraw'}
            rightIcon={<ArrowRight />}
          />
        </Card>
      </div>
    </Overlay>
  )
}
