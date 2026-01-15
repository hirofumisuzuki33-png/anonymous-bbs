import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Thread ID is required' });
      }

      const thread = await prisma.thread.findUnique({
        where: {
          id: parseInt(id, 10),
        },
        include: {
          board: true,
          posts: {
            orderBy: {
              number: 'asc',
            },
          },
        },
      });

      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }

      return res.status(200).json(thread);
    } catch (error) {
      console.error('Error fetching thread:', error);
      return res.status(500).json({ error: 'Failed to fetch thread' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
