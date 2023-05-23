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

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Hive endpoint

Much of the requests the app sends are served via a graphql server known as '[Hive](https://github.com/terra-money/hive-graph)'. While this is built for Terra, it should operate fine ontop of any Cosmos chain. If you require a local or testnet deployment of hive, you need to do the following:

Clone the [repo](https://github.com/terra-money/hive-graph)

Install all the dependencies:

```
npm ci
```

Copy the `.env.sample` file to `.env`

```
cp .env.sample .env
```

Update `LCD_URL` and `CHAIN_ID` to the endpoints of the chain you want to be querying.

In the project directory, you can run:

`npm run start:dev`

Runs the NodeJs services in the development mode.\
Open [localhost:8085/graphql](http://localhost:8085/graphql) to view it in the browser or Postman.

The service will reload if you make edits.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
