import {
  Player,
  ServerMessageWithoutContext,
  not,
  PlayerData,
  Deck,
  ClientMessage,
  isStartGameMessage,
  pickRandom,
  isPlayerActionMessage,
  isIncomePlayerAction,
  isForeignAidPlayerAction,
  isTaxPlayerAction,
  isStealPlayerAction,
  isCoupPlayerAction,
  StartGameMessage,
  PlayerActionMessage,
  isBlockActionMessage,
  isConfirmActionMessage,
  PlayerCanBlockMessage,
  BlockActionMessage,
  ConfirmActionMessage,
  isConfirmStealAction,
  isAssassinatePlayerAction,
  AnyoneCanBlockMessage,
  isConfirmForeignAidAction,
  CardData,
  Card,
  Action,
  isConfirmAssassinateAction,
  PlayerMustChooseCardToLoseMessage,
  isLoseCardMessage,
  LoseCardMessage,
  isBlockStealAction,
  isBlockAssassinateAction,
  isExchangePlayerAction,
  isChooseCardsMessage,
  ChooseCardsMessage,
  AssassinatePlayerAction,
  CoupPlayerAction,
  TaxAction,
} from "./";
import { IncomeAction } from "./Action";
import { isChallengeActionMessage } from "./types";

export type UniqueBroadcastFunction = (
  player: Player
) => ServerMessageWithoutContext;

export type RoomStatus = "waitingForPlayers" | "inProgress" | "over";

export type RoomData = {
  status: RoomStatus;
  code: string;

  minimumPlayers: 2;
  creator: PlayerData;
  players: PlayerData[];
  activePlayer: PlayerData | undefined;
  winner: PlayerData | undefined;
};

export type RoomConstructor = {
  code: string;
};

export class Room {
  public onEmpty?: () => void;

  public status: RoomStatus = "waitingForPlayers";
  public code: string;

  public minimumPlayers: 2 = 2;
  public players: Player[] = [];
  public creator: Player | undefined = undefined;
  public activePlayer: Player | undefined = undefined;

  public currentAction: Action | undefined;

  public deck = new Deck();

  get eliminatedPlayers() {
    return this.players.filter((player) => player.isEliminated);
  }

  get playersStillIn() {
    return this.players.filter((player) => !player.isEliminated);
  }

  get gameIsOver() {
    const hasPlayers = this.players.length > 0;
    const onlyOnePlayerHasCards = this.playersStillIn.length === 1;

    return hasPlayers && onlyOnePlayerHasCards;
  }

  get winner() {
    if (this.gameIsOver) {
      return this.playersStillIn[0];
    }

    return undefined;
  }

  constructor({ code }: RoomConstructor) {
    this.code = code;
  }

  setStatus = (status: RoomStatus) => (this.status = status);

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

    if (this.players.length === 0) {
      if (typeof this.onEmpty === "function") this.onEmpty();
    }
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
      return this.setActivePlayer(pickRandom(this.playersStillIn));
    }

    const currentActivePlayerIndex = this.playersStillIn.indexOf(
      this.activePlayer
    );

    if (currentActivePlayerIndex === -1) {
      return this.setActivePlayer(this.playersStillIn[0]);
    }

    const nextPlayerIndex =
      (currentActivePlayerIndex + 1) % this.playersStillIn.length;
    return this.setActivePlayer(this.playersStillIn[nextPlayerIndex]);
  };

  nextTurn = () => {
    const player = this.cycleActivePlayer();

    this.broadcast({
      type: "NewTurn",
      payload: {
        player: player.toJson(),
      },
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

  distributeCoins = () =>
    this.players.forEach((player) => player.updateCoinsBy(2));

  startGame = (message: StartGameMessage, player: Player) => {
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
    this.distributeCoins();
    this.setStatus("inProgress");

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

    this.nextTurn();
  };

  endGame = () => {
    this.setStatus("over");

    this.broadcast({
      type: "GameOver",
      payload: {
        winner: this.winner?.toJson() as PlayerData,
      },
    });
  };

  findPlayer = (target: PlayerData) =>
    this.players.find((player) => player.id === target.id);

  findCard = (target: CardData) =>
    this.deck.allCards.find((card) => card.id === target.id);

  createAction = (type: Action["type"], player: Player) => {
    if (type === "Income") {
      return (this.currentAction = new IncomeAction({ room: this, player }));
    }
    if (type === "Tax") {
      return (this.currentAction = new TaxAction({ room: this, player }));
    }
  };

  handlePlayerAction = (message: PlayerActionMessage, player: Player) => {
    if (player !== this.activePlayer) {
      return player.send({
        type: "UnauthorisedAction",
        payload: {
          message: "It is not your turn.",
        },
      });
    }

    if (!isCoupPlayerAction(message) && player.coins >= 10) {
      return player.send({
        type: "UnauthorisedAction",
        payload: {
          message: "You have ten or more coins and can must coup.",
        },
      });
    }

    if (isAssassinatePlayerAction(message) || isCoupPlayerAction(message)) {
      const requiredCoins = {
        Assassinate: 3,
        Coup: 7,
      }[message.payload.action.type];

      if (player.coins < requiredCoins) {
        const action = message.payload.action.type.toLowerCase();

        return player.send({
          type: "UnauthorisedAction",
          payload: {
            message: `You do not have enough coins to ${action}. You need ${requiredCoins} but only have ${player.coins}.`,
          },
        });
      }
    }

    if (isIncomePlayerAction(message) || isTaxPlayerAction(message)) {
      this.createAction(message.payload.action.type, player);
    }

    if (isForeignAidPlayerAction(message)) {
      return this.broadcast({
        type: "AnyoneCanBlock",
        payload: {
          action: {
            type: message.payload.action.type,
            player: player.toJson(),
          },
        },
      });
    }

    if (isStealPlayerAction(message) || isAssassinatePlayerAction(message)) {
      return this.broadcast({
        type: "PlayerCanBlock",
        payload: {
          action: {
            type: message.payload.action.type,
            target: message.payload.action.target,
            player: player.toJson(),
          },
        },
      });
    }

    if (isExchangePlayerAction(message)) {
      return this.broadcast({
        type: "PlayerMustChooseCards",
        payload: {
          action: {
            type: "Exchange",
            player: player.toJson(),
          },
          cards: this.deck.cards.slice(0, 2).map((card) => card.toJson()),
        },
      });
    }

    if (isCoupPlayerAction(message)) {
      player.updateCoinsBy(-7);

      // return this.broadcast({
      //   type: "PlayerMustChooseCardToLose",
      //   payload: {
      //     player: message.payload.action.target,
      //     action: {
      //       type: "Coup",
      //       target: message.payload.action.target,
      //       player: player.toJson(),
      //     },
      //   },
      // } as PlayerMustChooseCardToLoseMessage);
    }
  };

  handleBlockAction = (message: BlockActionMessage, player: Player) => {
    if (isBlockStealAction(message)) {
      this.findPlayer(message.payload.action.player)?.updateCoinsBy(-2);
    }

    if (isBlockAssassinateAction(message)) {
      this.findPlayer(message.payload.action.player)?.updateCoinsBy(-3);
    }

    this.nextTurn();
  };

  handleConfirmAction = (message: ConfirmActionMessage, player: Player) => {
    if (isConfirmForeignAidAction(message)) {
      this.findPlayer(message.payload.action.player)?.updateCoinsBy(2);
    }

    if (isConfirmStealAction(message)) {
      const player = this.findPlayer(message.payload.action.player);
      const target = this.findPlayer(message.payload.action.target);

      if (player && target) {
        const stolenCoins = target.coins >= 2 ? 2 : target.coins;

        player.updateCoinsBy(stolenCoins);
        target.updateCoinsBy(-stolenCoins);
      }
    }

    if (isConfirmAssassinateAction(message)) {
      this.findPlayer(message.payload.action.player)?.updateCoinsBy(-3);

      // return this.broadcast({
      //   type: "PlayerMustChooseCardToLose",
      //   payload: {
      //     player: message.payload.action.target,
      //     action: this.currentAction?.toJson(),
      //   },
      // });
    }

    this.nextTurn();
  };

  handleLoseCardMessage = (message: LoseCardMessage, player: Player) => {
    player.killCard(message.payload.card);

    player.send({
      type: "NewHand",
      payload: {
        hand: player.hand,
      },
    });

    if (this.gameIsOver) {
      return this.endGame();
    }

    this.nextTurn();
  };

  handleChooseCardsMessage = (message: ChooseCardsMessage, player: Player) => {
    const chosenCards = message.payload.chosenCards.map(this.findCard);
    const returnedCards = message.payload.returnedCards.map(this.findCard);

    if ([...chosenCards, ...returnedCards].includes(undefined)) {
      return player.send({
        type: "UnauthorisedAction",
        payload: {
          message: "Invalid cards chosen.",
        },
      });
    }

    player.setHand(chosenCards as Card[]);
    this.deck.returnCards(returnedCards as Card[]);

    player.send({
      type: "NewHand",
      payload: {
        hand: player.hand,
      },
    });

    this.nextTurn();
  };

  handleMessage = (message: ClientMessage, player: Player) => {
    if (isStartGameMessage(message)) {
      this.startGame(message, player);
    }

    if (isPlayerActionMessage(message)) {
      this.handlePlayerAction(message, player);
    }

    if (isChallengeActionMessage(message)) {
      this.currentAction?.challenge(player);
    }

    if (isBlockActionMessage(message)) {
      this.handleBlockAction(message, player);
    }

    if (isConfirmActionMessage(message)) {
      this.handleConfirmAction(message, player);
    }

    if (isLoseCardMessage(message)) {
      this.handleLoseCardMessage(message, player);
    }

    if (isChooseCardsMessage(message)) {
      this.handleChooseCardsMessage(message, player);
    }
  };

  toJson = (): RoomData => ({
    status: this.status,
    code: this.code,

    minimumPlayers: this.minimumPlayers,
    creator: (this.creator as Player).toJson(),
    players: this.players.map((player) => player.toJson()),
    activePlayer: this.activePlayer?.toJson(),
    winner: this.winner?.toJson(),
  });
}
