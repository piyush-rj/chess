import express from 'express';
import getGames from '../backend-controller/game-controller/getGames';
import leaveGame from '../backend-controller/game-controller/leaveGame';
import joinGame from '../backend-controller/game-controller/joinGame';
import createGame from '../backend-controller/game-controller/createGame';
import getGameById from '../backend-controller/game-controller/getGameById';
import makeMove from '../backend-controller/game-controller/makeMove';

const router = express.Router();

router.post('/game/create-game', createGame);
router.post('/game/leave-game', leaveGame);
router.post('/game/join-game', joinGame);
router.post('/game/make-move', makeMove);

router.get('/game/:id', getGameById);
router.get('/game/get-games', getGames);

export default router;
