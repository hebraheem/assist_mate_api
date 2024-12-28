import express from 'express';
import Chat from '../models/chat.js';

const router = express.Router();

router.get('/chats/:requestId', async (req, res, next) => {
  try {
    const chats = await Chat.find({ request: req.params.requestId })
      .populate('sender', 'name avatar')
      .sort({ timestamp: 1 });
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
});

export default router;
