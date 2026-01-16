import express from 'express';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/pdf-to-word', upload.single('file'), async (req, res) => {
  res.json({ success: true, message: 'API working' });
});

export default router;
