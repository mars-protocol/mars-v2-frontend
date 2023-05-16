// import { Button } from 'components/Button'
// import Divider from 'components/Divider'
// import { FormattedNumber } from 'components/FormattedNumber'
// import { ArrowRight } from 'components/Icons'
// import Slider from 'components/Slider'
// import Switch from 'components/Switch'
// import TokenInput from 'components/TokenInput'
// import Text from 'components/Text'

// interface Props {

// }

// export default function VaultDeposit() {
//   return (
//     <div className='flex h-full flex-col justify-between gap-6 p-4'>
//       <TokenInput
//         onChange={onChangePrimary}
//         amount={amount}
//         max={maxPrimaryAmount}
//         asset={primaryAsset}
//       />
//       <Slider value={percentage} onChange={onChangeSlider} />
//       <TokenInput
//         onChange={onChangeSecondary}
//         amount={amount}
//         max={maxSecondaryAmount}
//         asset={secondaryAsset}
//       />
//       <Divider />
//       <div className='flex justify-between'>
//         <Text className='text-white/50'>Custom amount</Text>
//         <Switch checked={isCustomAmount} onChange={handleSwitch} name='customAmount' />
//       </div>
//       <div className='flex justify-between'>
//         <Text className='text-white/50'>{`${primaryAsset.symbol}-${secondaryAsset.symbol} Position Value`}</Text>
//         <FormattedNumber amount={0} options={{ prefix: '$' }} />
//       </div>
//       <Button onClick={() => {}} className='w-full' text='Continue' rightIcon={<ArrowRight />} />
//     </div>
//   )
// }
