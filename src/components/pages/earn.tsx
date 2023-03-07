import Overview from 'components/Earn/Overview'

interface Props {
  params: PageParams
}

export default function EarnPage(props: Props) {
  return <Overview params={props.params} />
}
