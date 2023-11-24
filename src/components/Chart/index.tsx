import Card from 'components/Card'
import ChartBody from 'components/Chart/ChartBody'
import ChartLoading from 'components/Chart/ChartLoading'

interface Props {
  data: ChartData | null
  title: string
}

export default function Chart(props: Props) {
  return (
    <Card className='w-full' title={props.title} contentClassName='p-4 pr-0'>
      {props.data === null ? <ChartLoading /> : <ChartBody data={props.data} />}
    </Card>
  )
}
