import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, User, Clock, Send, Eye, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/lib/prisma';

type Board = {
  id: number;
  name: string;
};

type Post = {
  id: number;
  number: number;
  name: string;
  body: string;
  createdAt: string;
};

type Thread = {
  id: number;
  title: string;
  createdAt: string;
  board: Board;
  posts: Post[];
};

type Props = {
  thread: Thread;
};

export default function ThreadPage({ thread }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('edit');

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread.id,
          name: name || '名無しさん',
          body,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '投稿に失敗しました');
      }

      // 投稿成功後、フォームをリセットしてページをリロード
      setName('');
      setBody('');
      setActiveTab('edit');
      router.replace(router.asPath);
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
      second: '2-digit',
    });
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
        <title>{thread.title} - {thread.board.name}</title>
        <meta name="description" content={thread.title} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* ヘッダー */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link href={`/b/${thread.board.id}`}>
              <Button variant="ghost" className="mb-4 hover:bg-blue-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {thread.board.name}に戻る
              </Button>
            </Link>
            <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-3xl mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {thread.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {thread.posts.length}件のレス
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    作成: {formatDate(thread.createdAt)}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* レス一覧 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              レス一覧
            </h2>
            <AnimatePresence>
              {thread.posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Card className={`bg-white/90 backdrop-blur hover:shadow-md transition-shadow ${
                    post.number === 1 ? 'border-2 border-blue-300' : ''
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* レス番号アバター */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                          post.number === 1 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          {post.number}
                        </div>
                        
                        {/* レス内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              {post.name}
                            </span>
                            {post.number === 1 && (
                              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600">
                                スレ主
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <div className="text-slate-800 whitespace-pre-wrap break-words leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                            {post.body}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* レス投稿フォーム */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-2 border-indigo-200 bg-white/95 backdrop-blur sticky bottom-4 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  レスを投稿
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  {/* 名前入力 */}
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
                  </div>

                  {/* 本文入力（タブ付き） */}
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
                          placeholder="投稿内容を入力してください..."
                          rows={6}
                          maxLength={2000}
                          required
                          className="resize-none"
                        />
                      </TabsContent>
                      
                      <TabsContent value="preview" className="mt-4">
                        <div className="min-h-[144px] p-6 border-2 rounded-lg bg-slate-50 border-slate-200">
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

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || body.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>投稿中...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        投稿する
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { threadId } = context.query;

  if (!threadId || typeof threadId !== 'string') {
    return { notFound: true };
  }

  const thread = await prisma.thread.findUnique({
    where: { id: parseInt(threadId, 10) },
    include: {
      board: true,
      posts: {
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!thread) {
    return { notFound: true };
  }

  return {
    props: {
      thread: JSON.parse(JSON.stringify(thread)),
    },
  };
};
