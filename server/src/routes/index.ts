import express from 'express';
import signinController from '../backend-controller/user-controller/signinController';

const router = express.Router();

// user-endpoints
router.post('/sign-in', signinController);

// // chess-endpoints
// router.post('/game/create-game', createGame);
// router.post('/game/leave-game', leaveGame);
// router.post('/game/join-game', joinGame);
// router.post('/game/make-move', makeMove);

// router.get('/game/:id', getGameById);
// router.get('/game/get-games', getGames);

export default router;
