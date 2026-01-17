# Vercelデプロイ手順

このドキュメントでは、匿名掲示板アプリをVercelにデプロイする手順を説明します。

## 📋 前提条件

- Vercelアカウント
- GitHubリポジトリにコードをプッシュ済み
- PostgreSQLデータベース（Vercel Postgres推奨）

---

## 🚀 デプロイ手順

### ステップ1: Vercel Postgresデータベースの作成

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクト「anonymous-bbs」を選択
3. **Storage**タブをクリック
4. **Create Database**をクリック
5. **Postgres**を選択
6. データベース名を入力（例：`anonymous-bbs-db`）
7. リージョンを選択（推奨：Tokyo）
8. **Create**をクリック

### ステップ2: 環境変数の設定

Vercel Postgresを作成すると、以下の環境変数が自動的に追加されます：
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**追加で設定が必要な環境変数：**

1. プロジェクトの**Settings** → **Environment Variables**に移動
2. 以下の環境変数を追加：

```
DATABASE_URL = ${POSTGRES_PRISMA_URL}
DIRECT_URL = ${POSTGRES_URL_NON_POOLING}
```

**重要**: 環境変数は**Production**, **Preview**, **Development**すべてにチェックを入れてください。

### ステップ3: データベースマイグレーション

#### オプションA: ローカルから実行（推奨）

1. ローカルで環境変数を設定：

```powershell
# PowerShell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
```

2. マイグレーションを実行：

```bash
npx prisma migrate deploy
```

3. シードデータを投入：

```bash
npx prisma db seed
```

#### オプションB: Vercel CLIから実行

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトにリンク
vercel link

# 環境変数を取得してマイグレーション実行
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

### ステップ4: 再デプロイ

1. Vercelダッシュボードの**Deployments**タブに移動
2. 最新のデプロイメントを選択
3. **Redeploy**をクリック
4. **Use existing Build Cache**のチェックを外す
5. **Redeploy**をクリック

---

## 🔍 トラブルシューティング

### Internal Server Errorが発生する場合

1. **Runtime Logs**を確認：
   - Deploymentページで**Runtime Logs**をクリック
   - エラーメッセージを確認

2. **よくあるエラーと解決方法：**

#### エラー: `PrismaClientInitializationError`

**原因**: データベース接続文字列が正しくない

**解決方法**:
- 環境変数`DATABASE_URL`と`DIRECT_URL`が正しく設定されているか確認
- Vercel Postgresの接続文字列を再確認

#### エラー: `Table does not exist`

**原因**: マイグレーションが実行されていない

**解決方法**:
```bash
npx prisma migrate deploy
```

#### エラー: `No data found`

**原因**: シードデータが投入されていない

**解決方法**:
```bash
npx prisma db seed
```

### ビルドエラーが発生する場合

1. **Build Logs**を確認
2. `package.json`の`build`スクリプトを確認：
```json
"build": "prisma generate && prisma migrate deploy && next build"
```

3. Prismaクライアントが生成されているか確認：
```bash
npx prisma generate
```

---

## 📝 環境変数一覧

### 必須の環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | Prisma接続用URL（プーリング） | `${POSTGRES_PRISMA_URL}` |
| `DIRECT_URL` | 直接接続用URL（マイグレーション用） | `${POSTGRES_URL_NON_POOLING}` |

### Vercel Postgresが自動生成する変数

| 変数名 | 説明 |
|--------|------|
| `POSTGRES_URL` | 標準接続URL |
| `POSTGRES_PRISMA_URL` | Prisma最適化URL |
| `POSTGRES_URL_NON_POOLING` | プーリングなしURL |

---

## 🎯 デプロイ後の確認

1. デプロイされたURLにアクセス
2. 板一覧が表示されることを確認
3. スレッド作成が動作することを確認
4. レス投稿が動作することを確認

---

## 🔄 継続的デプロイ

GitHubにプッシュすると自動的にVercelがデプロイします：

1. コードを修正
2. Gitにコミット：
```bash
git add .
git commit -m "Update UI"
git push origin main
```
3. Vercelが自動的にビルド＆デプロイ

---

## 📚 参考リンク

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 💡 ヒント

### ローカル開発とVercelで異なるデータベースを使う

`prisma/schema.prisma`で環境に応じてデータベースを切り替え：

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

ローカルでは`.env`ファイルで：
```
DATABASE_URL="file:../data/app.db"  # SQLite
```

Vercelでは環境変数で：
```
DATABASE_URL="${POSTGRES_PRISMA_URL}"  # PostgreSQL
```

### データベースのバックアップ

定期的にデータベースをバックアップしましょう：

```bash
# PostgreSQLダンプ
pg_dump $DATABASE_URL > backup.sql

# リストア
psql $DATABASE_URL < backup.sql
```

---

問題が解決しない場合は、Vercelの**Runtime Logs**と**Build Logs**の内容を確認してください。
