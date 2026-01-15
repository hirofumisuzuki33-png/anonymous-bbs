import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { threadId, name, body } = req.body;

      // バリデーション
      if (!threadId || !body) {
        return res.status(400).json({ error: 'threadId and body are required' });
      }

      if (body.length < 1 || body.length > 2000) {
        return res.status(400).json({ error: 'Body must be between 1 and 2000 characters' });
      }

      if (name && name.length > 50) {
        return res.status(400).json({ error: 'Name must be 50 characters or less' });
      }

      // スレッドの存在確認
      const thread = await prisma.thread.findUnique({
        where: { id: parseInt(threadId, 10) },
      });

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      // 最新の投稿番号を取得
      const lastPost = await prisma.post.findFirst({
        where: { threadId: parseInt(threadId, 10) },
        orderBy: { number: 'desc' },
      });

      const nextNumber = (lastPost?.number || 0) + 1;

      // 投稿を作成し、スレッドのupdatedAtを更新
      const [post] = await prisma.$transaction([
        prisma.post.create({
          data: {
            threadId: parseInt(threadId, 10),
            number: nextNumber,
            name: name || '名無しさん',
            body,
          },
        }),
        prisma.thread.update({
          where: { id: parseInt(threadId, 10) },
          data: { updatedAt: new Date() },
        }),
      ]);

      return res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
