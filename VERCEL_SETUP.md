# 🚀 Vercelデプロイ クイックスタートガイド

このガイドでは、匿名掲示板アプリを**5分でVercelにデプロイ**する手順を説明します。

---

## ⚡ クイックスタート（5ステップ）

### 1️⃣ Vercel Postgresデータベースを作成

1. [Vercelダッシュボード](https://vercel.com/dashboard)を開く
2. プロジェクト「**anonymous-bbs**」を選択
3. **Storage**タブ → **Create Database** → **Postgres**
4. データベース名: `anonymous-bbs-db`
5. リージョン: **Tokyo** (推奨)
6. **Create**をクリック

### 2️⃣ 環境変数を設定

1. **Settings** → **Environment Variables**に移動
2. 以下の2つの環境変数を追加：

```
変数名: DATABASE_URL
値: ${POSTGRES_PRISMA_URL}
環境: Production, Preview, Development すべてチェック
```

```
変数名: DIRECT_URL
値: ${POSTGRES_URL_NON_POOLING}
環境: Production, Preview, Development すべてチェック
```

3. **Save**をクリック

### 3️⃣ データベースマイグレーションを実行

**ローカルで実行（推奨）:**

```powershell
# 1. Vercelから環境変数を取得
# Vercel Dashboard → Storage → Postgres → .env.local タブ
# 表示される接続文字列をコピー

# 2. PowerShellで環境変数を設定
$env:DATABASE_URL="postgresql://default:..."
$env:DIRECT_URL="postgresql://default:..."

# 3. マイグレーション実行
npx prisma migrate deploy

# 4. シードデータ投入
npx prisma db seed
```

### 4️⃣ Vercelで再デプロイ

1. **Deployments**タブに移動
2. 最新のデプロイメントの右側の「**...**」メニューをクリック
3. **Redeploy**を選択
4. ✅ **Use existing Build Cache**のチェックを**外す**
5. **Redeploy**をクリック

### 5️⃣ 動作確認

デプロイが完了したら、URLにアクセスして確認：

- ✅ 板一覧が表示される
- ✅ スレッドを作成できる
- ✅ レスを投稿できる

---

## 🔍 エラーが出た場合

### Internal Server Error (500)

**確認事項:**

1. **環境変数が設定されているか確認**
   - Settings → Environment Variables
   - `DATABASE_URL`と`DIRECT_URL`が存在するか

2. **Runtime Logsを確認**
   - Deployments → 該当のデプロイ → Runtime Logs
   - エラーメッセージを確認

3. **マイグレーションが実行されているか確認**
   ```bash
   npx prisma migrate deploy
   ```

### Build Error

**確認事項:**

1. **Build Logsを確認**
   - Deployments → 該当のデプロイ → Build Logs

2. **Prismaクライアントを再生成**
   ```bash
   npx prisma generate
   ```

3. **依存パッケージを再インストール**
   ```bash
   npm install
   ```

---

## 📊 接続文字列の取得方法

### Vercel Dashboardから取得:

1. **Storage**タブを開く
2. 作成したPostgresデータベースをクリック
3. **`.env.local`タブ**をクリック
4. 接続文字列が表示されます

### 表示される環境変数:

```bash
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"
```

---

## 🎯 よくある質問

### Q1: ローカルとVercelで異なるデータベースを使える？

**A:** はい、可能です。

- **ローカル**: SQLite（`file:../data/app.db`）
- **Vercel**: PostgreSQL（Vercel Postgres）

環境変数で切り替わります。

### Q2: シードデータを再投入したい

```bash
# 既存データを削除してシード再投入
npx prisma migrate reset
npx prisma db seed
```

### Q3: データベースをリセットしたい

```bash
# すべてのテーブルを削除して再作成
npx prisma migrate reset
```

⚠️ **注意**: 本番環境では実行しないでください！

### Q4: マイグレーションファイルを作成したい

```bash
# 新しいマイグレーションを作成
npx prisma migrate dev --name add_new_feature
```

---

## 🔐 セキュリティのベストプラクティス

1. **環境変数をGitにコミットしない**
   - `.env`ファイルは`.gitignore`に含まれています

2. **接続文字列を共有しない**
   - データベース接続文字列は機密情報です

3. **定期的にバックアップ**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

---

## 📚 次のステップ

デプロイが成功したら、以下を検討してください：

1. **カスタムドメインの設定**
   - Settings → Domains

2. **Analytics の有効化**
   - Analytics タブで有効化

3. **Speed Insights の確認**
   - Speed Insights タブでパフォーマンス確認

4. **環境変数の追加**
   - 必要に応じて追加の環境変数を設定

---

## 🆘 サポート

問題が解決しない場合：

1. [Vercel Discord](https://vercel.com/discord)
2. [Prisma Discord](https://pris.ly/discord)
3. [GitHub Issues](https://github.com/vercel/vercel/discussions)

---

## ✅ チェックリスト

デプロイ前に確認：

- [ ] Vercel Postgresデータベースを作成
- [ ] 環境変数`DATABASE_URL`を設定
- [ ] 環境変数`DIRECT_URL`を設定
- [ ] マイグレーション実行（`prisma migrate deploy`）
- [ ] シードデータ投入（`prisma db seed`）
- [ ] Vercelで再デプロイ（キャッシュなし）
- [ ] デプロイされたURLで動作確認

---

**これでVercelへのデプロイは完了です！** 🎉

何か問題があれば、Runtime LogsとBuild Logsを確認してください。
