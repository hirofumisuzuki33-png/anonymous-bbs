# 🔧 Vercel デプロイエラー修正履歴

## 日付: 2026-01-18

## 🔴 発生していた問題

- **エラー**: `PrismaClientInitializationError`
- **症状**: Vercelでデプロイは成功するが、実行時にInternal Server Error (500)
- **原因**: Prismaクライアントが環境変数を正しく読み込めていない

---

## ✅ 実施した修正

### 1. `lib/prisma.ts`の修正

**変更内容**:
- 環境変数`DATABASE_URL`を明示的に指定
- 開発環境と本番環境でログレベルを分ける
- `datasources`オプションを追加

**修正前**:
```typescript
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
```

**修正後**:
```typescript
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
```

### 2. `pages/api/boards/index.ts`にデバッグログ追加

**追加内容**:
- 環境変数の存在確認ログ
- エラーの詳細情報を返す

---

## 📋 次のステップ

### ステップ1: Gitにコミット＆プッシュ

```bash
git add .
git commit -m "Fix: Prisma client initialization for Vercel deployment"
git push origin main
```

### ステップ2: Vercelで自動デプロイを確認

GitHubにプッシュすると、Vercelが自動的にデプロイします。

または、手動で再デプロイ：
1. Vercelダッシュボード → Deployments
2. 最新デプロイの「...」メニュー → Redeploy
3. ✅ Use existing Build Cacheのチェックを外す
4. Redeploy

### ステップ3: デプロイ結果の確認

1. Runtime Logsで環境変数の確認ログを見る
2. サイトにアクセスして動作確認

---

## 🔍 期待される結果

### Runtime Logsに表示されるはず:
```
DATABASE_URL exists: true
Environment: production
```

### サイトで動作すること:
- ✅ トップページに4つの板が表示される
- ✅ 板をクリックしてスレッド一覧が表示される
- ✅ スレッドをクリックしてレスが表示される
- ✅ スレッド作成・レス投稿が動作する

---

## 📝 技術的な詳細

### なぜこの修正が必要だったか

Vercelのサーバーレス環境では、環境変数が実行時に動的に注入されます。Prismaクライアントの初期化時に`datasources`オプションで明示的に`DATABASE_URL`を指定することで、確実に環境変数を読み込めるようになります。

### Prisma + Vercel のベストプラクティス

1. `datasources`で環境変数を明示的に指定
2. 接続プーリングを使用（Neonは自動でサポート）
3. ログレベルを環境ごとに調整
4. グローバルインスタンスを使用してコールドスタートを最適化

---

## 🆘 まだエラーが出る場合

### チェックポイント:

1. **環境変数の確認**
   - Vercel → Settings → Environment Variables
   - `DATABASE_URL`と`DIRECT_URL`が設定されているか

2. **Neonデータベースの確認**
   - Neonダッシュボードでデータベースが稼働しているか
   - 接続文字列が正しいか

3. **Build Logsの確認**
   - `prisma generate`が成功しているか
   - エラーメッセージの内容

4. **Runtime Logsの確認**
   - 環境変数のログが表示されているか
   - 具体的なエラーメッセージ

---

## 📚 参考リンク

- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
