FROM node:24.22.1-alpine

# Java JREをインストール
RUN apk upgrade --no-cache \
    && apk add --no-cache openjdk11-jre ca-certificates \
    && update-ca-certificates

# Firebase CLIをグローバルインストール
RUN npm install -g firebase-tools

# 作業ディレクトリ設定
WORKDIR /app

# ポート公開
EXPOSE 4000 9099 8080

# Emulator起動コマンド
CMD ["firebase", "emulators:start", "--project", "demo-meshipiyo"]