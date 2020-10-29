import { IPlayer, RoundFunc } from '../../types.ts';
import { Circle } from './Circle.ts';
import { Deck } from './Deck.ts';

export class Game<PlayerType extends IPlayer> {
  // Player-related variables
  private players: Circle<PlayerType>;
  // add players to the game
  private playerList: PlayerType[];

  //card-related variables
  private questionDeck: Deck<string>;

  // Game-related variables
  private numberOfRounds: number;
  private stopRequested = false;
  private round: RoundFunc<PlayerType>;

  constructor(questions: string[], round: RoundFunc<PlayerType>) {
    this.players = new Circle([]);
    this.playerList = [];
    this.numberOfRounds = questions.length;
    this.questionDeck = new Deck(questions);
    this.round = round;
  }

  addPlayer(player: PlayerType) {
    this.playerList.push(player);
  }

  async notifyAll(message: any, round: number): Promise<void> {
    for (let player of this.players.map.values()) {
      await player.boradcast({ round: round + 1, ...message });
    }
  }

  async start() {
    this.players = new Circle(this.playerList);

    for (let i = 0; i < this.numberOfRounds; i++) {
      if (this.stopRequested) break;
      const judge = this.players.circle();
      const question = this.questionDeck.pickTopCard();
      await this.notifyAll({ q: question.value, j: judge.value.nickname }, i);
      const winnerId = await this.round(this.players.map, judge.id);
      const winner = this.players.map.get(winnerId)!;
      winner.cardsWon.add(question.id);
      await this.notifyAll({ playerWon: winner.nickname }, i);
    }
  }

  stop() {
    this.stopRequested = true;
  }
}