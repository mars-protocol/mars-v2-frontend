This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install the dependencies:

```
yarn install
```

Then, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Trading charts

The trade charts are sourced with the TradingView [charting_library](https://www.tradingview.com/charting-library-docs/). In order to enable the charts, request has to be requested from TradingView. This allows the charting_library package to be pulled-in during the application build process. For this, it is recommended to do the following:

1. Request access to the TradingView repository
2. Create a private fork
3. Generate a Personal Access Token from Github
4. Add the following to the environment variables:
   a. CHARTING_LIBRARY_USERNAME -> the username of the account with access
   b. CHARTING_LIBRARY_ACCESS_TOKEN -> the access token
   c. CHARTING_LIBRARY_REPOSITORY -> the URI of the Github repository
5. Build the application by executing the `install_charting_library.sh` script prior.

For development on localhost, run `yarn install-charting-library`. Ensure that you have a `.env.local` file defined with the variables mentioned above.
