import { v4 as uuid } from "uuid";

import {
  Room,
  Player,
  PlayerActionMessage,
  PlayerData,
  IncomeAction,
  ForeignAidAction,
  TaxAction,
  StealAction,
  getFutureDate,
  CardData,
} from "../";
import { BlockActionMessage } from "../types";

const TIME_TO_RESPOND = 10000;

export type Action = IncomeAction | ForeignAidAction | TaxAction;

export interface ActionData {
  id: string;
  status: Action["status"];
  type: Action["type"];
  player: PlayerData;
  target?: PlayerData;
  challengeBefore?: string;
  blockBefore?: string;
  canBeBlockedBy?: "anyone" | PlayerData;
}

export interface BaseActionConstructor {
  room: Room;
  type: Action["type"];
  player: Player;
  canBeBlockedBy?: Action["canBeBlockedBy"];
}

export type ActionConstructor = Pick<BaseActionConstructor, "room" | "player">;

export type TargetedActionConstructor = ActionConstructor & { target: Player };

export interface OptionalActionMethods {
  created?: () => void;
  completed?: () => void;
  challengeIsSuccessful?: (challenger: Player) => boolean;
  blockIsSuccessful?: (blocker: Player) => boolean;
}

export interface BaseAction extends OptionalActionMethods {}

export abstract class BaseAction {
  public id: string = uuid();
  public room: Room;

  protected _status:
    | "pending"
    | "awaitingChallenge"
    | "challengeSucceeded"
    | "challengeFailed"
    | "awaitingBlock"
    | "awaitingChallengeToBlock"
    | "succeeded"
    | "failed"
    | "completed" = "pending";
  public readonly type: PlayerActionMessage["payload"]["action"]["type"];
  public player: Player;
  public target?: Player;

  public canBeChallenged?: boolean;
  public challengeBefore?: Date;
  public playersSkippingChallenge: Player[] = [];

  public canBeBlocked?: boolean;
  public canBeBlockedBy?: "anyone" | Player;
  public blockBefore?: Date;
  public blockedWith?: CardData;

  protected completesImmediatelyAfterSucceeding: boolean;

  abstract succeeded: () => void;

  get status() {
    return this._status;
  }

  setStatus = (status: Action["status"]) => (this._status = status);

  constructor({ room, type, player, canBeBlockedBy }: BaseActionConstructor) {
    this.room = room;
    this.type = type;
    this.player = player;

    this.completesImmediatelyAfterSucceeding =
      this.type === "Income" ||
      this.type === "ForeignAid" ||
      this.type === "Tax" ||
      this.type === "Steal";

    this.canBeBlockedBy = canBeBlockedBy;
    this.canBeBlocked = !!this.canBeBlockedBy;

    setTimeout(this.created);
  }

  created = () => {
    this.canBeChallenged = typeof this.challengeIsSuccessful === "function";

    console.log("this.toJson():", this.toJson());

    if (this.canBeChallenged) {
      this.setStatus("awaitingChallenge");
      return this.giveOpportunityToChallenge();
    }

    if (this.canBeBlocked) {
      this.setStatus("awaitingBlock");
      return this.giveOpportunityToBlock();
    }

    this.succeed();
  };

  giveOpportunityToChallenge = () => {
    this.challengeBefore = getFutureDate(TIME_TO_RESPOND);
    this.playersSkippingChallenge = [];

    this.room.broadcast({
      type: "ActionPending",
      payload: {
        action: this.toJson(),
      },
    });

    setTimeout(() => {
      if (this.status === "awaitingChallenge") this.notSuccessfullyChallenged();
      if (this.status === "awaitingChallengeToBlock")
        this.blockNotSuccessfullyChallenged();
    }, TIME_TO_RESPOND);
  };

  skipChallenge = (player: Player) => {
    if (
      player == this.player ||
      this.playersSkippingChallenge.includes(player)
    ) {
      return;
    }

    this.playersSkippingChallenge.push(player);

    const everyOtherPlayerHasSkipped = this.room.players
      .filter((player) => player !== this.player)
      .every((player) => this.playersSkippingChallenge.includes(player));

    if (everyOtherPlayerHasSkipped) {
      this.notSuccessfullyChallenged();
    }
  };

  challenge = (challenger: Player) => {
    if (!this.challengeIsSuccessful) return;

    const challengeIsSuccessful = this.challengeIsSuccessful(challenger);

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

    if (!challengeIsSuccessful) {
      this.notSuccessfullyChallenged();
    }
  };

  notSuccessfullyChallenged = () => {
    if (this.canBeBlocked) {
      return this.giveOpportunityToBlock();
    }

    this.succeed();
  };

  giveOpportunityToBlock = () => {
    this.blockBefore = getFutureDate(TIME_TO_RESPOND);

    this.room.broadcast({
      type: "ActionPending",
      payload: {
        action: this.toJson(),
      },
    });

    setTimeout(() => {
      if (this.status === "awaitingBlock") this.succeed();
    }, TIME_TO_RESPOND);
  };

  block = (blockedWith: BlockActionMessage["payload"]["with"]) => {
    this.setStatus("awaitingChallengeToBlock");
    this.giveOpportunityToChallenge();
  };

  blockNotSuccessfullyChallenged = () => {
    this.succeed();
  };

  succeed = () => {
    this.setStatus("succeeded");
    this.succeeded();

    this.room.broadcast({
      type: "ActionSucceeded",
      payload: {
        action: this.toJson(),
      },
    });

    if (this.completesImmediatelyAfterSucceeding) this.complete();
  };

  complete = () => {
    this.setStatus("completed");
    if (this.completed) this.completed();

    this.room.broadcast({
      type: "ActionCompleted",
      payload: {
        action: this.toJson(),
      },
    });

    this.room.nextTurn();
  };

  toJson = (): ActionData => ({
    id: this.id,
    status: this.status,
    type: this.type,
    player: this.player.toJson(),
    target: this.target?.toJson(),
    challengeBefore: this.challengeBefore?.toISOString(),
    blockBefore: this.blockBefore?.toISOString(),
    canBeBlockedBy:
      this.canBeBlockedBy instanceof Player
        ? this.canBeBlockedBy.toJson()
        : this.canBeBlockedBy,
  });
}

export abstract class ChallengeableAction extends BaseAction {
  abstract challengeIsSuccessful?: (challenger: Player) => boolean;
}
