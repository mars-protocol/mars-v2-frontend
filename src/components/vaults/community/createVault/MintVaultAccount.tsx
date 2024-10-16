import Button from 'components/common/Button'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import Text from 'components/common/Text'
import { ArrowRight, Vault } from 'components/common/Icons'

export default function MintVaultAccount() {
  return (
    <CreateVaultContent cardClassName='h-118 flex justify-end'>
      <div className='flex flex-col items-center w-full gap-24'>
        <div className='flex flex-col items-center justify-center w-80 gap-6'>
          <div className='flex items-center justify-center h-28 w-28 bg-white/10 rounded-full'>
            <Vault className='h-10 w-10' />
          </div>
          <div className='text-center space-y-2'>
            <Text size='base'>Create Vault Account</Text>
            <Text size='sm' className='text-white/60'>
              We require one more transaction approval from you in order to continue.
            </Text>
          </div>
        </div>

        <Button
          // TODO: add Crate vault acc logic
          onClick={() => {}}
          variant='solid'
          color='primary'
          size='md'
          rightIcon={<ArrowRight />}
          className='w-full md:w-auto'
          text='Create Vault Account (2/2)'
        />
      </div>
    </CreateVaultContent>
  )
}
