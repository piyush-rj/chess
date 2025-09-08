import express from 'express';
import signinController from '../backend-controller/user-controller/signinController';
import getCapturedPieces from '../backend-controller/game-controller/getCapturedPieces';
import getActiveGame from '../backend-controller/game-controller/getActiveGames';

const router = express.Router();

// user-endpoints
router.post('/sign-in', signinController);

// chess-endpoints
router.get('/game/captured-pieces', getCapturedPieces);
router.get('/game/active-game', getActiveGame);
// router.post('/game/create-game', createGame);
// router.post('/game/leave-game', leaveGame);
// router.post('/game/join-game', joinGame);
// router.post('/game/make-move', makeMove);

// router.get('/game/:id', getGameById);
// router.get('/game/get-games', getGames);

export default router;
