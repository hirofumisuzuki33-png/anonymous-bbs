import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { boardId, page = '1' } = req.query;

      if (!boardId || typeof boardId !== 'string') {
        return res.status(400).json({ error: 'boardId is required' });
      }

      const pageNum = parseInt(page as string, 10);
      const pageSize = 20;
      const skip = (pageNum - 1) * pageSize;

      const [threads, total] = await Promise.all([
        prisma.thread.findMany({
          where: {
            boardId: parseInt(boardId, 10),
          },
          include: {
            _count: {
              select: { posts: true },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          skip,
          take: pageSize,
        }),
        prisma.thread.count({
          where: {
            boardId: parseInt(boardId, 10),
          },
        }),
      ]);

      return res.status(200).json({
        threads,
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      console.error('Error fetching threads:', error);
      return res.status(500).json({ error: 'Failed to fetch threads' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { boardId, title, name, body } = req.body;

      // バリデーション
      if (!boardId || !title || !body) {
        return res.status(400).json({ error: 'boardId, title, and body are required' });
      }

      if (title.length < 1 || title.length > 100) {
        return res.status(400).json({ error: 'Title must be between 1 and 100 characters' });
      }

      if (body.length < 1 || body.length > 2000) {
        return res.status(400).json({ error: 'Body must be between 1 and 2000 characters' });
      }

      if (name && name.length > 50) {
        return res.status(400).json({ error: 'Name must be 50 characters or less' });
      }

      // スレッドと最初の投稿を作成
      const thread = await prisma.thread.create({
        data: {
          boardId: parseInt(boardId, 10),
          title,
          posts: {
            create: {
              number: 1,
              name: name || '名無しさん',
              body,
            },
          },
        },
        include: {
          posts: true,
        },
      });

      return res.status(201).json(thread);
    } catch (error) {
      console.error('Error creating thread:', error);
      return res.status(500).json({ error: 'Failed to create thread' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
