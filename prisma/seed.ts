import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 既存のデータをクリア
  await prisma.post.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.board.deleteMany();

  // 板（カテゴリ）の作成
  const boards = await Promise.all([
    prisma.board.create({
      data: {
        name: 'ニュース速報',
        description: '最新のニュースについて語り合う板です',
      },
    }),
    prisma.board.create({
      data: {
        name: '雑談',
        description: '何でも気軽に話せる板です',
      },
    }),
    prisma.board.create({
      data: {
        name: '技術',
        description: 'プログラミングや技術について議論する板です',
      },
    }),
    prisma.board.create({
      data: {
        name: 'ゲーム',
        description: 'ゲームの話題全般を扱う板です',
      },
    }),
  ]);

  console.log(`Created ${boards.length} boards`);

  // サンプルスレッドの作成
  const thread1 = await prisma.thread.create({
    data: {
      boardId: boards[0].id,
      title: '【速報】今日のニュース',
    },
  });

  await prisma.post.create({
    data: {
      threadId: thread1.id,
      number: 1,
      name: '名無しさん',
      body: 'このスレッドでは今日のニュースについて語りましょう',
    },
  });

  const thread2 = await prisma.thread.create({
    data: {
      boardId: boards[1].id,
      title: '自己紹介スレ',
    },
  });

  await prisma.post.create({
    data: {
      threadId: thread2.id,
      number: 1,
      name: '名無しさん',
      body: 'ここで自己紹介してください！',
    },
  });

  const thread3 = await prisma.thread.create({
    data: {
      boardId: boards[2].id,
      title: 'Next.jsについて語るスレ',
    },
  });

  await prisma.post.create({
    data: {
      threadId: thread3.id,
      number: 1,
      name: '名無しさん',
      body: 'Next.js最高ですね',
    },
  });

  await prisma.post.create({
    data: {
      threadId: thread3.id,
      number: 2,
      name: '名無しさん',
      body: 'App RouterとPages Routerどっち使ってる?',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
