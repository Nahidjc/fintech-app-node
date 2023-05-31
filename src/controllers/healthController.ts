import { Request, Response } from 'express';

export const healthController = (_req: Request, res: Response ): void => {
  try {
    const response = {
      status: 'OK',
      message: 'Server is healthy',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
