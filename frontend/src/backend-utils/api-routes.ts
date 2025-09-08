export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1';

export const SIGNIN_URL= BACKEND_URL + '/sign-in';
export const GAME_URL = BACKEND_URL + '/game';
export const GET_CAPTURED_PIECES_URL = GAME_URL + '/captured-pieces';
export const GET_ACTIVE_GAME_URL = GAME_URL + '/active-game';