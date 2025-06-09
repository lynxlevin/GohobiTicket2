# ごほうびチケット アプリケーション概要

## About
This repository used to provide Django backend.
For Django backend with React frontend, checkout `django_version` tag.

For the newest version, use the React frontend in this repository alongside Actix-Web backend provided in the following repository.
https://github.com/lynxlevin/gohobi_ticket_actix_backend

## Running frontend
```shell
cd /gt_front2
npm install
npm start
```

## 主な機能
- ごほうびチケット機能
  - パートナーへ一日のお礼のメッセージと共にチケットを付与。
  - もらったチケットを使用すると、お願い事のメッセージをLINEなどで送信することができる。
  - 月に1枚限りの特別チケット機能
  - Slackでのメッセージ送信機能
  - 下書き機能
  - 未読管理機能
- パートナーとの日記機能
  - お互い編集可能な共有日記の機能
  - 日記へのタグ付け機能
  - その日の月齢表示機能
  - 未読管理機能

## アプリ作成の目的
個人的に日々利用しているアプリです。
- 基本的なサービス運用の経験を積むため
  - 障害発生時の対応
  - ランニングコストを意識した運用
  - アプリデザイン、アプリケーションコード作成からデプロイまでの一貫作業の経験
  - データの蓄積とともに必要となるパフォーマンス改善
  - 長期間にわたって扱うことで保守性の違いなどを実体験
  - ライブラリアップデートなど
- 日々の業務におけるコアスキルのアップデート、研鑽の場
  - 当初はRuby on rails + Vueで作成したものを、Django + Reactに変更
  - 業務で実践する前のサンドボックス的活用

## 省略した実装
個人利用が主目的のため、新規ユーザー追加時に利用する機能は後回しにしている。
- アカウント作成機能
- UserRelation作成機能
- チケット画像登録機能
- Slackメッセージ送信機能の汎用化
  - 現状は、API_URLの環境変数への手入力により対応。本来はOAuthによりUserRelationごとにDBで管理を行いたい。