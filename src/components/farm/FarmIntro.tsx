import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import useChainConfig from 'hooks/chain/useChainConfig'
import { DocURL } from 'types/enums'

export default function FarmIntro() {
  const chainConfig = useChainConfig()
  const hasHLS = chainConfig.hls

  return (
    <Intro
      text={
        <>
          <span className='text-white'>Farm</span> by providing liquidity to earn fees and rewards.{' '}
          {hasHLS && (
            <>
              Use <span className='text-white'>Leverage Staking</span> to amplify staking yields, or{' '}
              <span className='text-white'>Leveraged Farming</span> to boost LP positions. HLS
              strategies run in isolated accounts for independent risk management.{' '}
            </>
          )}
          Riches and ruins lie ahead.
        </>
      }
      bg='farm'
    >
      <Button
        text='Learn about Farming'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.FARM_INTRO_URL, '_blank')
        }}
        color='secondary'
      />
      {hasHLS && (
        <Button
          text='Learn about HLS'
          leftIcon={<PlusSquared />}
          onClick={(e) => {
            e.preventDefault()
            window.open(DocURL.HLS_INTRO_URL, '_blank')
          }}
          color='secondary'
        />
      )}
    </Intro>
  )
}
