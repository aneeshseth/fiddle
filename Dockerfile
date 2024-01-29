FROM node:18

WORKDIR /base

COPY ["package.json", "./package.json"]
COPY ["turbo.json", "./turbo.json"]
COPY ["packages/eslint-config", "./packages/eslint-config"]
COPY ["packages/typescript-config", "./packages/typescript-config"]
COPY ["apps/api", "./apps/api"]

EXPOSE 3004

RUN cd /base && npm install 
RUN cd /base/apps/api && npm install && npm install typescript && npx tsc -b


CMD ["npm", "run", "be"]