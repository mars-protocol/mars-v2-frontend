import { SVGProps } from 'types'

export const Failed = ({ color = '#C83333' }: SVGProps) => {
  return (
    <svg version='1.1' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M1.5 40C1.5 18.737 18.737 1.5 40 1.5C61.263 1.5 78.5 18.737 78.5 40C78.5 61.263 61.263 78.5 40 78.5C18.737 78.5 1.5 61.263 1.5 40Z'
        fill='none'
        stroke={color}
        strokeWidth='3'
      />
      <path
        d='M23.6128 21.9054L23.6128 21.9054C23.272 21.9056 22.9391 22.0074 22.6565 22.1979C22.374 22.3883 22.1546 22.6588 22.0265 22.9745C21.8985 23.2903 21.8675 23.6371 21.9375 23.9706C22.0076 24.3039 22.1753 24.6087 22.4194 24.8462C22.4195 24.8463 22.4197 24.8465 22.4199 24.8467L37.5753 40.0025L22.4199 55.1577C22.4197 55.1579 22.4196 55.1581 22.4194 55.1583C22.2567 55.3163 22.127 55.5051 22.0379 55.7137C21.9486 55.9225 21.9018 56.1469 21.9 56.374C21.8983 56.6011 21.9418 56.8262 22.0279 57.0364C22.114 57.2465 22.241 57.4374 22.4015 57.598C22.5621 57.7585 22.7529 57.8856 22.963 57.9718C23.1731 58.0579 23.3982 58.1016 23.6253 58.1C23.8525 58.0983 24.0769 58.0514 24.2857 57.9622C24.4943 57.8731 24.6831 57.7436 24.8412 57.5809C24.8414 57.5807 24.8416 57.5806 24.8417 57.5804L39.9973 42.4245L55.1536 57.5806C55.1537 57.5807 55.1538 57.5808 55.1539 57.5809C55.3122 57.743 55.5011 57.8719 55.7096 57.9605C55.9182 58.0491 56.1424 58.0955 56.3691 58.0968C56.5958 58.0982 56.8205 58.0546 57.0302 57.9684C57.2399 57.8823 57.4304 57.7553 57.5907 57.595C57.751 57.4347 57.8778 57.2442 57.9639 57.0345C58.05 56.8247 58.0936 56.6 58.0922 56.3733C58.0908 56.1466 58.0444 55.9225 57.9557 55.7139C57.8671 55.5055 57.7381 55.3166 57.5761 55.1584C57.5759 55.1582 57.5757 55.1581 57.5756 55.1579L42.4198 40.0025L57.5751 24.847C57.5753 24.8468 57.5756 24.8465 57.5758 24.8463C57.7395 24.6885 57.8701 24.4997 57.9601 24.2909C58.0502 24.0818 58.0978 23.8569 58.0999 23.6292C58.1021 23.4015 58.0588 23.1757 57.9727 22.9649C57.8866 22.7542 57.7593 22.5627 57.5983 22.4017C57.4373 22.2407 57.2458 22.1134 57.0351 22.0273C56.8243 21.9412 56.5985 21.8979 56.3708 21.9001C56.1432 21.9022 55.9182 21.9497 55.7091 22.0399C55.5003 22.1299 55.3115 22.2605 55.1537 22.4242C55.1535 22.4245 55.1533 22.4247 55.1531 22.4249L39.9973 37.5804L24.8417 22.4245C24.8415 22.4244 24.8414 22.4242 24.8412 22.424C24.6816 22.2599 24.4907 22.1295 24.2799 22.0405C24.0688 21.9513 23.842 21.9053 23.6128 21.9054Z'
        fill={color}
        stroke={color}
        strokeWidth='0.2'
      />
    </svg>
  )
}
