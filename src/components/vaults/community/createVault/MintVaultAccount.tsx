import Button from 'components/common/Button'
import CreateVaultContent from 'components/vaults/community/createVault/CreateVaultContent'
import Text from 'components/common/Text'
import VaultDetails from 'components/vaults/community/vaultDetails/index'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { ArrowRight, Vault } from 'components/common/Icons'
import { getPage, getRoute } from 'utils/route'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

interface Props {
  vaultAddress: string
}

export default function MintVaultAccount(props: Props) {
  const { vaultAddress } = props
  const [isTxPending, setIsTxPending] = useState(false)
  const createAccount = useStore((s) => s.createAccount)

  const accountId = useAccountId()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const navigate = useNavigate()

  const handleCreateVault = useCallback(async () => {
    setIsTxPending(true)
    try {
      const accountKind = {
        fund_manager: {
          vault_addr: vaultAddress,
        },
      }
      console.log('accountKind:', accountKind)

      const response = await createAccount(accountKind, false)

      console.log('response:', response)
      console.log(vaultAddress, 'vaultAddressvaultAddress')

      if (response === null) {
        setIsTxPending(false)
        return
      }

      if (accountId) {
        navigate(
          getRoute(
            getPage(`vaults/${vaultAddress}/details`, chainConfig),
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
      }
    } catch (error) {
      console.error('Failed to create vault account:', error)
    } finally {
      setIsTxPending(false)
    }
  }, [
    vaultAddress,
    createAccount,
    accountId,
    navigate,
    chainConfig,
    searchParams,
    address,
    pathname,
  ])

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
          onClick={handleCreateVault}
          variant='solid'
          color='primary'
          size='md'
          rightIcon={<ArrowRight />}
          className='w-full md:w-70'
          text='Create Vault Account (2/2)'
          showProgressIndicator={isTxPending}
          disabled={isTxPending}
        />
      </div>
    </CreateVaultContent>
  )
}
