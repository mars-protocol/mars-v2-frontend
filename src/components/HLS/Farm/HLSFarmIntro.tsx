import React from 'react'

import Button from 'components/Button'
import { PlusSquared } from 'components/Icons'
import Intro from 'components/Intro'
import { DocURL } from 'types/enums/docURL'

export default function HlsFarmIntro() {
  return (
    <Intro
      bg='farm'
      text={
        <>
          <span className='text-white'>Leveraged farming</span> is a strategy where users borrow
          funds to increase their yield farming position, aiming to earn more in rewards than the
          cost of the borrowed assets.
        </>
      }
    >
      <Button
        text='Learn how to Farm'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.FARM_INTRO_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
