# 匿名掲示板Webサイト

会員登録不要で誰でも匿名でスレッド作成・投稿・閲覧ができる5ch風の掲示板アプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 15 (Pages Router) + TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui + Radix UI
- **アイコン**: lucide-react
- **アニメーション**: framer-motion
- **データベース**: SQLite
- **ORM**: Prisma
- **ランタイム**: Node.js

## 機能

- ✅ 板（カテゴリ）一覧表示
- ✅ スレッド一覧表示（板配下）
- ✅ スレッド詳細表示（レス一覧）
- ✅ スレッド作成（匿名）
- ✅ レス投稿（匿名）
- ✅ ページング対応
- ✅ レスポンシブデザイン
- ✅ アニメーション効果

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Prismaクライアントの生成

```bash
npx prisma generate
```

### 3. データベースのマイグレーション

```bash
npx prisma migrate dev --name init
```

このコマンドで以下が実行されます：
- `data/app.db` にSQLiteデータベースが作成されます
- テーブル（Board, Thread, Post）が作成されます

### 4. 初期データのシード

```bash
npx prisma db seed
```

このコマンドで以下のサンプルデータが投入されます：
- 4つの板（ニュース速報、雑談、技術、ゲーム）
- いくつかのサンプルスレッドと投稿

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 画面構成

### 1. 板一覧（トップページ）
- URL: `/`
- 全ての板を一覧表示
- 各板のスレッド数を表示

### 2. スレッド一覧
- URL: `/b/[boardId]`
- 選択した板のスレッド一覧を表示
- 最終更新日時の降順で表示
- 新規スレッド作成フォーム

### 3. スレッド詳細
- URL: `/t/[threadId]`
- スレッドのレス一覧を表示
- レス投稿フォーム

## API エンドポイント

### 板関連
- `GET /api/boards` - 板一覧取得

### スレッド関連
- `GET /api/threads?boardId={id}&page={page}` - スレッド一覧取得
- `POST /api/threads` - スレッド作成
- `GET /api/threads/[id]` - スレッド詳細取得

### 投稿関連
- `POST /api/posts` - レス投稿

## データベーススキーマ

### Board（板）
- `id`: 主キー
- `name`: 板名
- `description`: 説明
- `createdAt`: 作成日時

### Thread（スレッド）
- `id`: 主キー
- `boardId`: 板ID（外部キー）
- `title`: タイトル
- `createdAt`: 作成日時
- `updatedAt`: 更新日時（最新レス日時）

### Post（投稿）
- `id`: 主キー
- `threadId`: スレッドID（外部キー）
- `number`: 投稿番号（スレッド内連番）
- `name`: 名前（デフォルト: "名無しさん"）
- `body`: 本文
- `createdAt`: 投稿日時

## バリデーション

### スレッド作成
- タイトル: 1〜100文字（必須）
- 名前: 0〜50文字（任意）
- 本文: 1〜2000文字（必須）

### レス投稿
- 名前: 0〜50文字（任意）
- 本文: 1〜2000文字（必須）

## セキュリティ対策

- XSS対策: 本文はHTMLエスケープして表示
- SQLインジェクション対策: Prisma ORMによる自動エスケープ

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Prismaクライアント生成
npm run prisma:generate

# マイグレーション実行
npm run prisma:migrate

# シード実行
npm run prisma:seed

# Prisma Studio起動（データベースGUI）
npx prisma studio
```

## プロジェクト構造

```
bbs-app/
├── components/          # UIコンポーネント
│   └── ui/             # shadcn/uiコンポーネント
├── data/               # SQLiteデータベース（自動生成）
├── lib/                # ユーティリティ
│   ├── prisma.ts       # Prismaクライアント
│   └── utils.ts        # ヘルパー関数
├── pages/              # Next.js Pages
│   ├── api/           # APIエンドポイント
│   ├── b/             # 板・スレッド一覧
│   ├── t/             # スレッド詳細
│   ├── _app.tsx       # アプリケーションルート
│   ├── _document.tsx  # HTMLドキュメント
│   └── index.tsx      # トップページ
├── prisma/            # Prismaスキーマ・マイグレーション
│   ├── schema.prisma  # データベーススキーマ
│   └── seed.ts        # シードデータ
├── public/            # 静的ファイル
├── styles/            # グローバルスタイル
└── 仕様書.md          # 機能要件仕様書
```

## トラブルシューティング

### データベースをリセットしたい場合

```bash
# データベースファイルを削除
rm -rf data/

# マイグレーションとシードを再実行
npx prisma migrate dev --name init
npx prisma db seed
```

### Prismaクライアントのエラーが出る場合

```bash
# Prismaクライアントを再生成
npx prisma generate
```

## 🎨 最新アップデート (2026-01-15)

### カスタマイズ案2を実装しました！

「リッチな投稿フォーム＆プレビュー機能」を中心に、全体的なUIを大幅に改善しました。

#### 主な変更点:
- ✅ 鮮やかなブルー〜インディゴのグラデーション配色
- ✅ スレッド作成フォームをダイアログ化
- ✅ 編集/プレビュータブ機能の追加
- ✅ リアルタイム文字数カウント（色分け表示）
- ✅ 統計情報カード（トップページ）
- ✅ モダンなカードデザイン
- ✅ 滑らかなアニメーション効果
- ✅ レスポンシブ対応の強化

詳細は [CHANGELOG.md](./CHANGELOG.md) をご確認ください。

---

## ライセンス

MIT
