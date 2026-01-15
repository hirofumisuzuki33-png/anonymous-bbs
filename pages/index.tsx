import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Layers, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';

type Board = {
  id: number;
  name: string;
  description: string | null;
  _count: {
    threads: number;
  };
};

type Props = {
  boards: Board[];
};

export default function Home({ boards }: Props) {
  return (
    <>
      <Head>
        <title>匿名掲示板 - 板一覧</title>
        <meta name="description" content="匿名掲示板の板一覧" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* ヘッダーセクション */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              匿名掲示板
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              会員登録不要で誰でも自由に投稿できる掲示板です。<br />
              気軽にスレッドを立てて、みんなと話しましょう。
            </p>
          </motion.div>

          {/* 統計情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          >
            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">板の数</p>
                  <p className="text-2xl font-bold text-slate-900">{boards.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-indigo-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">総スレッド数</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {boards.reduce((sum, board) => sum + board._count.threads, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">みんなで議論</p>
                  <p className="text-2xl font-bold text-slate-900">活発</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 板一覧 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-900">板一覧</h2>
              <Badge variant="secondary" className="text-sm">
                {boards.length}個の板
              </Badge>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {boards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/b/${board.id}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-blue-300 bg-white/90 backdrop-blur group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                            {board.name}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {board._count.threads}
                          </Badge>
                        </div>
                        {board.description && (
                          <CardDescription className="text-base">
                            {board.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>クリックして参加する</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* フッター */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center text-sm text-muted-foreground"
          >
            <p>© 2026 匿名掲示板 - 自由な議論の場</p>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const boards = await prisma.board.findMany({
    include: {
      _count: {
        select: { threads: true },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  return {
    props: {
      boards: JSON.parse(JSON.stringify(boards)),
    },
  };
};
