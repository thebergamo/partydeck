import { serve, Response, acceptable, ServerRequest } from './deps.ts';
import { Game } from './game/Game.ts';
import { Player } from './player/Player.ts';
import { generate } from './shared/NumericID.ts';
import { Acceptable, TestFunction } from './types.ts';

export class Server {
  static get INVALID_CODE_RES(): Response {
    const status = 422;
    const body = JSON.stringify({ err: 'invalid or blank code' });
    return { status, body };
  }

  static get TEST_GAME(): [string[], string[]] {
    return [
      ['question1', 'question2', 'question3'],
      [
        'a1',
        'a2',
        'a3',
        'a4',
        'a5',
        'a6',
        'a7',
        'a8',
        'a9',
        'a10',
        'a11',
        'a12',
        'a13',
        'a14',
        'a15',
        'a16',
        'a17',
        'a18',
        'a19',
        'a20',
        'a21',
        'a22',
        'a23',
        'a24',
        'a25',
        'a26',
        'a27',
        'a28',
        'a29',
        'a30',
        'a31',
        'a32',
        'a33',
        'a34',
        'a35',
        'a36',
        'a37',
      ],
    ];
  }

  static async serve(port: number) {
    const server = new Server();
    for await (const req of serve({ port })) {
      const res = await server.reqHandler(req);
      if (res) req.respond(res);
    }
  }

  static async test(iteration: TestFunction) {
    const server = new Server();
    const tester = serve({ port: 8000 });
    console.log('server is up');
    let i = 0;
    for await (const req of tester) {
      await server.reqHandler(req);
      i++;
      if (!iteration(server.pendingGames, server.activeGames)) break;
    }
    tester.close();
    return i;
  }

  private pendingGames: Map<string, Game<Player>>;
  private activeGames: Map<string, Game<Player>>;

  constructor() {
    this.pendingGames = new Map();
    this.activeGames = new Map();
  }

  createGame(questions: string[], answers: string[]): Game<Player> {
    const id = generate();
    if (this.activeGames.has(id) || this.pendingGames.has(id))
      return this.createGame(questions, answers);
    const game = new Game<Player>(id, questions, answers);
    game.on('connection', Player.newInstance);
    game.on('start', async () => {
      this.activeGames.set(id, game);
      this.pendingGames.delete(id);
    });
    game.on('round', Player.roundHandler);
    game.on('end', async () => {
      this.activeGames.delete(id);
    });
    this.pendingGames.set(id, game);
    return game;
  }

  async reqHandler(req: ServerRequest): Promise<Response | null> {
    const { url } = req;
    if (url.startsWith('/check')) {
      const params = new URLSearchParams(url.split('?')[1]);
      const code = params.get('code');
      const exists = Boolean(code && this.pendingGames.has(code));
      const status = exists ? 200 : 404;
      return { status, body: JSON.stringify({ exists }) };
    }
    await this.connect(req);
    return null;
  }

  async connect(req: ServerRequest): Promise<boolean> {
    const { conn, r: bufReader, w: bufWriter, headers, url } = req;
    const params = new URLSearchParams(url.split('?')[1]);
    const code = params.get('code');
    const name = params.get('name') || 'anonymous';
    const wsParams: Acceptable = { conn, bufReader, bufWriter, headers };
    let game: Game<Player>;
    if (!acceptable(req)) return false;
    else if (code === 'new') game = this.createGame(...Server.TEST_GAME);
    else if (code && this.pendingGames.has(code))
      game = this.pendingGames.get(code)!;
    else {
      req.respond(Server.INVALID_CODE_RES);
      return false;
    }
    await Player.acceptWebSocket(game, name, wsParams);
    return true;
  }

  async listen() {
    const server = serve({ port: 8000 });
    console.log('server is up!');
    for await (const req of server) {
      await this.connect(req);
    }
  }
}
