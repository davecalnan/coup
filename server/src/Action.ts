import { v4 as uuid } from "uuid";

import { Player, PlayerActionMessage, PlayerData } from "./";
import { Room } from "./Room";

export type Action = IncomeAction | ForeignAidAction | TaxAction;

export interface ActionData {
  id: string;
  status: Action["status"];
  type: Action["type"];
  player: PlayerData;
  target?: PlayerData;
  challengeBefore?: string;
}

export interface BaseActionConstructor {
  room: Room;
  type: Action["type"];
  player: Player;
  target?: Player;
  canBeChallenged?: boolean;
}

export interface OptionalActionMethods {
  created?: () => void;
  determineIfChallengedSuccessfully?: (challenger: Player) => boolean;
}

export interface BaseAction extends OptionalActionMethods {}

export abstract class BaseAction {
  public id: string = uuid();
  public room: Room;

  protected _status:
    | "pending"
    | "challengeSucceeded"
    | "challengeFailed"
    | "failed"
    | "blocked"
    | "completed" = "pending";
  public readonly type: PlayerActionMessage["payload"]["action"]["type"];
  public player: Player;
  public target?: Player;

  public canBeChallenged?: boolean;
  public challengeBefore?: Date;

  abstract completed: () => void;

  get status() {
    return this._status;
  }

  constructor({ room, type, player, canBeChallenged }: BaseActionConstructor) {
    this.room = room;
    this.type = type;
    this.player = player;

    this.canBeChallenged = canBeChallenged;

    if (!canBeChallenged) {
      setTimeout(this.complete);
      return this;
    }

    setTimeout(this.create);
  }

  setStatus = (status: Action["status"]) => (this._status = status);

  create = () => {
    if (this.created) this.created();

    if (this.status === "pending" && this.challengeBefore) {
      this.room.broadcast({
        type: "ActionPending",
        payload: {
          action: this.toJson(),
        },
      });
    }
  };

  challenge = (challenger: Player) => {
    console.log("challenged by:", challenger.toJson());
    if (!this.determineIfChallengedSuccessfully) return;

    const challengeIsSuccessful = this.determineIfChallengedSuccessfully(
      challenger
    );
    console.log("challengeIsSuccessful:", challengeIsSuccessful);

    if (challengeIsSuccessful) {
      this.setStatus("challengeSucceeded");
    } else {
      this.setStatus("challengeFailed");
    }

    const playerWhoLostChallenge = challengeIsSuccessful
      ? this.player
      : challenger;

    this.room.broadcast({
      type: "PlayerMustChooseCardToLose",
      payload: {
        player: playerWhoLostChallenge.toJson(),
        action: this.toJson(),
      },
    });
  };

  complete = () => {
    this.setStatus("completed");
    this.completed();

    this.room.broadcast({
      type: "ActionCompleted",
      payload: {
        action: this.toJson(),
      },
    });

    this.room.nextTurn();

    return this;
  };

  toJson = (): ActionData => ({
    id: this.id,
    status: this.status,
    type: this.type,
    player: this.player.toJson(),
    target: this.target?.toJson(),
    challengeBefore: this.challengeBefore?.toISOString(),
  });
}

export type IncomeActionConstructor = Pick<
  BaseActionConstructor,
  "room" | "player"
>;

export class IncomeAction extends BaseAction {
  constructor({ room, player }: IncomeActionConstructor) {
    super({
      room,
      type: "Income",
      player,
    });
  }

  completed = () => {
    this.player.updateCoinsBy(1);
  };
}

export type ForeignAidActionConstructor = Pick<
  BaseActionConstructor,
  "room" | "player"
>;

export class ForeignAidAction extends BaseAction {
  constructor({ room, player }: ForeignAidActionConstructor) {
    super({
      room,
      type: "ForeignAid",
      player,
    });
  }

  completed = () => {
    this.player.updateCoinsBy(2);
  };

  block = () => {};
}

export type TaxActionConstructor = Pick<
  BaseActionConstructor,
  "room" | "player"
>;

export class TaxAction extends BaseAction {
  constructor({ room, player }: TaxActionConstructor) {
    super({
      room,
      type: "Tax",
      player,
      canBeChallenged: true,
    });
  }

  determineIfChallengedSuccessfully = () => {
    const hasADuke = !!this.player.hand
      .filter((card) => !card.isDead)
      .find((card) => card.type === "duke");

    return !hasADuke;
  };

  setChallengeBefore = (ms: number) => {
    const date = new Date();
    date.setMilliseconds(date.getMilliseconds() + ms);

    this.challengeBefore = date;
  };

  created = () => {
    this.setChallengeBefore(10000);
    setTimeout(this.completeIfNotChallenged, 10000);
  };

  completeIfNotChallenged = () => {
    if (this.status === "pending") {
      this.complete();
    }
  };

  completed = () => {
    this.player.updateCoinsBy(3);
  };
}
