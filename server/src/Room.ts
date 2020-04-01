import { Player, ServerMessageWithoutContext, not } from "./";

export class Room {
  public players: Player[] = [];
  public activePlayer: Player | null = null;

  addPlayer = (player: Player) => {
    const isFirstPlayer = this.players.length === 0;
    if (isFirstPlayer) {
      this.setActivePlayer(player);
    }
    this.players.push(player);

    this.broadcast({
      type: "NewPlayer",
      payload: {
        player: player.toJson()
      }
    });

    return player;
  };

  removePlayer = (player: Player) => {
    this.players = this.players.filter(not(player));

    this.broadcast({
      type: "PlayerLeft",
      payload: {
        player: player.toJson()
      }
    });
  };

  broadcast = (message: ServerMessageWithoutContext) =>
    this.players.forEach(player => player.send(message));

  broadcastToAllExcept = (
    message: ServerMessageWithoutContext,
    player: Player
  ) => this.players.filter(not(player)).forEach(player => player.send(message));

  setActivePlayer = (player: Player) => {
    this.activePlayer?.setInactive();

    this.activePlayer = player;
    player.setActive();

    return player;
  };

  cycleActivePlayer = (): Player => {
    if (!this.activePlayer) {
      return this.setActivePlayer(this.players[0]);
    }

    const currentActivePlayerIndex = this.players.indexOf(this.activePlayer);

    if (currentActivePlayerIndex === -1) {
      return this.setActivePlayer(this.players[0]);
    }

    const nextPlayerIndex =
      (currentActivePlayerIndex + 1) % this.players.length;
    return this.setActivePlayer(this.players[nextPlayerIndex]);
  };

  nextTurn = () => {
    this.cycleActivePlayer();

    this.broadcast({
      type: "NewTurn",
      payload: {}
    });
  };

  toJson = () => ({
    players: this.players.map(player => player.toJson()),
    activePlayer: this.activePlayer?.toJson()
  });
}
