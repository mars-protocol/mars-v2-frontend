import LendPage from 'components/pages/lend'

interface Props {
  children: React.ReactNode
  params: PageParams
}

export default function Page(props: Props) {
  return <LendPage {...props} />
}
