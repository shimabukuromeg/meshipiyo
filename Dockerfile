FROM node:24.13-slim AS base
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app

# package.jsonをコピーしてpnpmバージョンを抽出
COPY apps/backend/package.json /app/apps/backend/package.json
# package.jsonからpnpmバージョンを抽出してインストール
RUN node -e 'const pkg = require("./apps/backend/package.json"); \
    const pnpmVersion = pkg.packageManager.split("@")[1]; \
    console.log(`pnpmバージョン ${pnpmVersion} をインストールします`); \
    require("child_process").execSync(`npm install -g pnpm@${pnpmVersion}`, {stdio: "inherit"});'

# ビルドステージ
FROM base AS build
# プロジェクトのルートディレクトリからファイルをコピー
COPY . /app

# backend の依存関係のインストール
RUN pnpm --filter backend install --frozen-lockfile

# プロジェクトのビルド
RUN pnpm --filter backend build

# 本番用の node_modules の作成
RUN pnpm --filter=backend deploy --prod /deploy/backend
WORKDIR /deploy/backend
RUN pnpm prisma generate

# 本番ステージ
FROM base AS backend
COPY --from=build /deploy/backend /app/apps/backend
WORKDIR /app/apps/backend
EXPOSE 44000

CMD [ "pnpm", "start" ]