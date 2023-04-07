import FarmPage from 'components/pages/farm'

interface Props {
  children: React.ReactNode
  params: PageParams
}

export default function Page(props: Props) {
  return <FarmPage {...props} />
}
