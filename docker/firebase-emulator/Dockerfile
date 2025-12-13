FROM node:24-alpine

# Java JREをインストール
RUN apk add --no-cache openjdk11-jre

# Firebase CLIをグローバルインストール
RUN npm install -g firebase-tools

# 作業ディレクトリ設定
WORKDIR /app

# ポート公開
EXPOSE 4000 9099 8080

# Emulator起動コマンド
CMD ["firebase", "emulators:start", "--project", "demo-meshipiyo"]