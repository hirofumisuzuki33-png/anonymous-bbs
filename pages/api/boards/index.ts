import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // デバッグ: 環境変数の確認
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      console.log('Environment:', process.env.NODE_ENV);
      
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

      return res.status(200).json(boards);
    } catch (error) {
      console.error('Error fetching boards:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(500).json({ 
        error: 'Failed to fetch boards',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
