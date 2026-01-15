import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Clock, Plus, Eye, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { prisma } from '@/lib/prisma';

type Board = {
  id: number;
  name: string;
  description: string | null;
};

type Thread = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
};

type Props = {
  board: Board;
  threads: Thread[];
  total: number;
  page: number;
  totalPages: number;
};

export default function BoardPage({ board, threads, total, page, totalPages }: Props) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit');

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: board.id,
          title,
          name: name || '名無しさん',
          body,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'スレッドの作成に失敗しました');
      }

      const newThread = await response.json();
      
      // フォームをリセット
      setTitle('');
      setName('');
      setBody('');
      setShowCreateDialog(false);
      setActiveTab('edit');
      
      router.push(`/t/${newThread.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTitleCharCountColor = () => {
    if (title.length === 0) return 'text-muted-foreground';
    if (title.length > 80) return 'text-orange-600';
    if (title.length >= 100) return 'text-red-600';
    return 'text-green-600';
  };

  const getBodyCharCountColor = () => {
    if (body.length === 0) return 'text-muted-foreground';
    if (body.length > 1800) return 'text-orange-600';
    if (body.length >= 2000) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <>
      <Head>
        <title>{board.name} - スレッド一覧</title>
        <meta name="description" content={board.description || board.name} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link href="/">
              <Button variant="ghost" className="mb-4 hover:bg-blue-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                板一覧に戻る
              </Button>
            </Link>
            <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {board.name}
                    </CardTitle>
                    {board.description && (
                      <p className="text-slate-600">{board.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                    {total}スレッド
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* スレッド作成ボタン */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              新規スレッド作成
            </Button>
          </motion.div>

          {/* Dialog for Thread Creation */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">新規スレッド作成</DialogTitle>
                <DialogDescription>
                  スレッドのタイトルと最初の投稿を入力してください
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateThread} className="space-y-6 mt-4">
                {/* タイトル */}
                <div>
                  <Label htmlFor="title" className="text-base font-semibold">
                    タイトル <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="スレッドのタイトルを入力"
                    maxLength={100}
                    required
                    className="mt-2"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <p className={`text-sm font-medium ${getTitleCharCountColor()}`}>
                      {title.length}/100文字
                    </p>
                    {title.length > 80 && (
                      <Badge variant={title.length >= 100 ? "destructive" : "secondary"}>
                        {title.length >= 100 ? "文字数超過" : "残り少ない"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 名前 */}
                <div>
                  <Label htmlFor="name" className="text-base font-semibold">
                    名前（任意）
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="名無しさん"
                    maxLength={50}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    未入力の場合は「名無しさん」として投稿されます
                  </p>
                </div>

                {/* 本文（タブ付き） */}
                <div>
                  <Label htmlFor="body" className="text-base font-semibold">
                    本文 <span className="text-red-500">*</span>
                  </Label>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit" className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4" />
                        編集
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        プレビュー
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="edit" className="mt-4">
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="スレッドの最初の投稿を入力してください..."
                        rows={10}
                        maxLength={2000}
                        required
                        className="resize-none"
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-4">
                      <div className="min-h-[240px] p-6 border-2 rounded-lg bg-slate-50 border-slate-200">
                        {body ? (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">プレビュー:</p>
                            <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{body}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground italic">
                              本文を入力するとプレビューが表示されます
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-between items-center mt-1.5">
                    <p className={`text-sm font-medium ${getBodyCharCountColor()}`}>
                      {body.length}/2000文字
                    </p>
                    {body.length > 1800 && (
                      <Badge variant={body.length >= 2000 ? "destructive" : "secondary"}>
                        {body.length >= 2000 ? "文字数超過" : "残り少ない"}
                      </Badge>
                    )}
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setActiveTab('edit');
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || title.length === 0 || body.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isSubmitting ? '作成中...' : 'スレッドを作成'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* スレッド一覧 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              スレッド一覧
            </h2>
            <div className="space-y-3">
              {threads.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      まだスレッドがありません。最初のスレッドを作成しましょう！
                    </p>
                  </CardContent>
                </Card>
              ) : (
                threads.map((thread, index) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link href={`/t/${thread.id}`}>
                      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/90 backdrop-blur border-l-4 border-l-blue-500 hover:border-l-indigo-600">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                                {thread.title}
                              </h3>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <MessageSquare className="w-4 h-4" />
                                  <span className="font-medium">{thread._count.posts}</span>
                                  <span>レス</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(thread.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              #{thread.id}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link href={`/b/${board.id}?page=${page - 1}`}>
                    <Button variant="outline">前へ</Button>
                  </Link>
                )}
                <span className="flex items-center px-4 text-sm font-medium text-slate-700 bg-white rounded-md border">
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={`/b/${board.id}?page=${page + 1}`}>
                    <Button variant="outline">次へ</Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { boardId, page = '1' } = context.query;

  if (!boardId || typeof boardId !== 'string') {
    return { notFound: true };
  }

  const board = await prisma.board.findUnique({
    where: { id: parseInt(boardId, 10) },
  });

  if (!board) {
    return { notFound: true };
  }

  const pageNum = parseInt(page as string, 10);
  const pageSize = 20;
  const skip = (pageNum - 1) * pageSize;

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: { boardId: board.id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.thread.count({
      where: { boardId: board.id },
    }),
  ]);

  return {
    props: {
      board: JSON.parse(JSON.stringify(board)),
      threads: JSON.parse(JSON.stringify(threads)),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
