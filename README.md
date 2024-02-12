# Mars Protocol v2 Outpost Frontend

![mars-banner-1200w](https://marsprotocol.io/banner.png)

## 1. Web App

This project is a [NextJS](https://nextjs.org/). React application.

The project utilises [React hooks](https://reactjs.org/docs/hooks-intro.html), functional components, [Zustand](https://github.com/pmndrs/zustand) for state management, and [useSWR](https://swr.vercel.app/) for general data fetching and management.

Styles are handled with [Tailwind](https://tailwindcss.com/).

Typescript is added and utilised (but optional if you want to create .jsx or .tsx files).

## 2. Deployment

Start web server

```bash
yarn && yarn dev
```

### 2.1 Custom node endpoints using non-Docker deployments

Copy `.env.example` to `.env` and modify the values to suit your needs.

### 2.2 Custom node endpoints using Docker

We allow the use of environment variables to be passed to the Docker container to specify custom endpoints for the app. The variables are:

| Variable          | Description                           | Default                                  |
| ----------------- | ------------------------------------- | ---------------------------------------- |
| URL_OSMOSIS_REST  | The Osmosis node REST endpoint to use | https://lcd-osmosis.blockapsis.com       |
| URL_OSMOSIS_RPC   | The Osmosis node RPC endpoint to use  | https://rpc-osmosis.blockapsis.com       |
| WALLET_CONNECT_ID | Your projects WalletConnect v2 ID     | 0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x |

### 2.3 OPTIONAL: Install TradingView library

The Outpost UI has a [TradingView](https://www.tradingview.com/) implementation, to display charts for the listed assets. To enable it you have to pass these environment variables to the Docker container. _NOTE: You'll need to have an active TradingView license to obtain those credentials_

| Variable                      | Description                                                           | Default                                  |
| ----------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| CHARTING_LIBRARY_USERNAME     | Your github user, that has access to the TradingView charting library |                                          |
| CHARTING_LIBRARY_ACCESS_TOKEN | The charting library access token                                     |                                          |
| CHARTING_LIBRARY_REPOSITORY   | The url to the TradingView charting library                           | github.com/tradingview/charting_library/ |

**Sample Docker run command**

This command will start the container in interactive mode with port 3000 bound to localhost and print logs to stdout.

```sh
docker run -it -p 3000:3000 \
      -e URL_OSMOSIS_REST=https://lcd-osmosis.blockapsis.com \
      -e URL_OSMOSIS_RPC=https://rpc-osmosis.blockapsis.com \
      -e WALLET_CONNECT_ID=0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x0x marsprotocol/interface:latest
```

## 4. Development practices

### 4.1 Data orchestration

Data is handled with a combination of container components, useSWR and a caching mechanism. API hooks are responsible for syncing the application state.

## 5. Contributing

We welcome and encourage contributions! Please create a pull request with as much information about the work you did and what your motivation/intention was.

## 6. License

Contents of this repository are open source under the [Mars Protocol Web Application License Agreement](./LICENSE).
