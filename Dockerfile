FROM node:22-alpine as builder
WORKDIR /app

COPY package.json ./
RUN corepack enable
RUN pnpm install
COPY . .
RUN apk --update add patch
RUN patch next.config.js next-config.patch

ENV NEXT_PUBLIC_NETWORK=mainnet
ENV NEXT_PUBLIC_OSMOSIS_RPC=APP_NEXT_OSMOSIS_RPC
ENV NEXT_PUBLIC_OSMOSIS_REST=APP_NEXT_OSMOSIS_REST
ENV NEXT_PUBLIC_NEUTRON_RPC=APP_NEXT_NEUTRON_RPC
ENV NEXT_PUBLIC_NEUTRON_REST=APP_NEXT_NEUTRON_REST
ENV NEXT_PUBLIC_WALLET_CONNECT_ID=APP_NEXT_WALLET_CONNECT_ID
ENV NODE_ENV=production

RUN pnpm build

FROM node:20-alpine as runner
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/next.config.js .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY entrypoint.sh .

RUN apk add --no-cache --upgrade bash
RUN ["chmod", "+x", "./entrypoint.sh"]
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 3000
CMD ["node", "server.js"]

# Labels
# https://github.com/opencontainers/image-spec/blob/main/annotations.md
LABEL org.opencontainers.image.title="mars-fe"
LABEL org.opencontainers.image.description="Mars Protocol Outpost Frontend"
LABEL org.opencontainers.image.authors="info@mars.foundation"
LABEL org.opencontainers.image.source=https://github.com/mars-protocol/mars-v2-frontend
