import Button from 'components/common/Button'
import { ArrowRight, Vault } from 'components/common/Icons'
import Text from 'components/common/Text'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import VaultDetails from 'components/vaults/community/vaultDetails/index'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export default function MintVaultAccount() {
  const accountId = useAccountId()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const navigate = useNavigate()
  const handleCreate = useCallback(() => {
    // TODO: Implement mint vault acc logic

    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    if (accountId)
      navigate(
        getRoute(
          getPage(`vaults/${tempVaultAddress}/details`, chainConfig),
          searchParams,
          address,
          accountId,
        ),
      )

    useStore.setState({
      focusComponent: {
        component: <VaultDetails />,
        onClose: () => {
          navigate(getRoute(getPage(pathname, chainConfig), searchParams, address))
        },
      },
    })
  }, [accountId, navigate, chainConfig, searchParams, address, pathname])

  return (
    <CreateVaultContent cardClassName='h-118 flex justify-end'>
      <div className='flex flex-col items-center w-full gap-24'>
        <div className='flex flex-col items-center justify-center gap-6 w-80'>
          <div className='flex items-center justify-center rounded-full h-28 w-28 bg-white/10'>
            <Vault className='w-10 h-10' />
          </div>
          <div className='space-y-2 text-center'>
            <Text size='base'>Create Vault Account</Text>
            <Text size='sm' className='text-white/60'>
              We require one more transaction approval from you in order to continue.
            </Text>
          </div>
        </div>

        <Button
          // TODO: add Create vault acc logic
          onClick={handleCreate}
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
