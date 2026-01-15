import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
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
      return res.status(500).json({ error: 'Failed to fetch boards' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
