import { SVGProps } from 'types'

export const SortNone = ({ color = '#FFFFFF' }: SVGProps) => {
  return (
    <svg fill='none' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M12.3123 7.24988L15.887 10.1096C16.256 10.4048 16.0472 11 15.5746 11L8.42539 11C7.95275 11 7.74397 10.4048 8.11304 10.1096L11.6877 7.24988C11.8703 7.10379 12.1297 7.10379 12.3123 7.24988Z'
        fill={color}
        fillOpacity='0.2'
      />
      <path
        d='M11.6877 16.7501L8.11304 13.8904C7.74397 13.5952 7.95275 13 8.42539 13H15.5746C16.0472 13 16.256 13.5952 15.887 13.8904L12.3123 16.7501C12.1297 16.8962 11.8703 16.8962 11.6877 16.7501Z'
        fill={color}
        fillOpacity='0.2'
      />
    </svg>
  )
}
