import { MESSAGE_TYPE, IncomingChessMessage } from '../types/web-socket-types';
    
export class ChessClient {
  private ws: WebSocket;

  constructor(url: string, onMessage: (msg: IncomingChessMessage) => void) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const msg: IncomingChessMessage = JSON.parse(event.data);
        onMessage(msg);
      } catch (err) {
        console.error('invalid ws message:', event.data);
      }
    };
  }

  public sendMove(from: string, to: string) {
    this.ws.send(
      JSON.stringify({
        type: MESSAGE_TYPE.MOVE,
        move: { from, to },
      })
    );
  }
}
