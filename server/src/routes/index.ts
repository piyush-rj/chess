import express from 'express';
import getGame from '../backend-controller/game-controller/getGame';
import initGame from '../backend-controller/game-controller/initiGame';

const router = express.Router();

router.post('/game', initGame);
router.get('/game', getGame);

export default router;