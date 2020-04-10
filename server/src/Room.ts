import {
  Player,
  ServerMessageWithoutContext,
  not,
  PlayerData,
  Deck,
  ClientMessage,
  isStartGameMessage,
} from "./";
import { GameStartedMessage } from "./types";

export type UniqueBroadcastFunction = (
  player: Player
) => ServerMessageWithoutContext;

export type RoomStatus = "waitingForPlayers" | "playingGame";

export type RoomData = {
  status: RoomStatus;
  code: string;

  minimumPlayers: 2;
  creator: PlayerData;
  players: PlayerData[];
  activePlayer: PlayerData | undefined;
};

export type RoomConstructor = {
  code: string;
};

export class Room {
  public status: RoomStatus = "waitingForPlayers";
  public code: string;

  public minimumPlayers: 2 = 2;
  public players: Player[] = [];
  public creator: Player | undefined = undefined;
  public activePlayer: Player | undefined = undefined;

  public deck = new Deck();

  constructor({ code }: RoomConstructor) {
    this.code = code;
  }

  addPlayer = (player: Player) => {
    const isFirstPlayer = this.players.length === 0;
    if (isFirstPlayer) {
      this.creator = player;
    } else {
      const nameIsAlreadyTaken = this.players.find(
        ({ name }) => player.name === name
      );

      if (nameIsAlreadyTaken) {
        player.send({
          type: "NameAlreadyTaken",
          payload: {
            player: player.toJson(),
          },
        });

        return;
      }
    }

    this.players.push(player);

    this.broadcast({
      type: "NewPlayer",
      payload: {
        player: player.toJson(),
      },
    });
  };

  removePlayer = (player: Player) => {
    this.players = this.players.filter(not(player));

    this.broadcast({
      type: "PlayerLeft",
      payload: {
        player: player.toJson(),
      },
    });
  };

  broadcast = (
    messageOrFunction: ServerMessageWithoutContext | UniqueBroadcastFunction
  ) =>
    this.players.forEach((player) =>
      player.send(
        typeof messageOrFunction === "function"
          ? messageOrFunction(player)
          : messageOrFunction
      )
    );

  broadcastToAllExcept = (
    message: ServerMessageWithoutContext,
    player: Player
  ) =>
    this.players.filter(not(player)).forEach((player) => player.send(message));

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
      payload: {},
    });
  };

  dealCards = () => {
    this.players.map((player, index) =>
      player.giveCards(
        this.deck.cards[index],
        this.deck.cards[index + this.players.length]
      )
    );
  };

  startGame = (message: ClientMessage, player: Player) => {
    const isCreator = player.name === this.creator?.name;

    if (!isCreator) {
      return this.broadcast({
        type: "UnauthorisedAction",
        payload: {
          message: "Only the creator can start the game.",
        },
      });
    }

    const hasEnoughPlayers = this.players.length >= this.minimumPlayers;

    if (!hasEnoughPlayers) {
      return this.broadcast({
        type: "UnauthorisedAction",
        payload: {
          message: `The game needs more players to start. Current: ${this.players.length}. Needs: ${this.minimumPlayers}.`,
        },
      });
    }

    this.dealCards();

    this.status = "playingGame";

    this.broadcast((player) => ({
      type: "NewHand",
      payload: {
        hand: player.hand,
      },
    }));

    this.broadcast({
      type: "GameStarted",
      payload: {},
    });
  };

  handleMessage = async (message: ClientMessage, player: Player) => {
    if (isStartGameMessage(message)) this.startGame(message, player);
  };

  toJson = (): RoomData => ({
    status: this.status,
    code: this.code,

    minimumPlayers: this.minimumPlayers,
    creator: (this.creator as Player).toJson(),
    players: this.players.map((player) => player.toJson()),
    activePlayer: this.activePlayer?.toJson(),
  });
}
