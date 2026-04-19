import express from 'express';
import { searchAllTools } from '../controlers/searchController.js';

const router = express.Router();

router.get('/tools', searchAllTools);

export default router;
