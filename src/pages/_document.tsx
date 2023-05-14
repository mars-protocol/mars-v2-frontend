import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='m-0 p-0' lang='en'>
      <Head />
      <body className='m-0 cursor-default bg-body p-0 font-sans text-white'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
