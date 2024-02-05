import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='p-0 m-0 scrollbar-hide' lang='en'>
      <Head>
        <script defer src='/charting_library/charting_library.standalone.js' />
        <script defer src='/datafeeds/udf/dist/bundle.js' />
        <script defer src='https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js' />
      </Head>
      <body className='p-0 m-0 overflow-x-hidden font-sans text-white cursor-default bg-body scrollbar-hide'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
