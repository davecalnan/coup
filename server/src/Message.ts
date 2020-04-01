import {
  MessagePayload,
  MessageData,
  Context,
  MessageWithContext,
  encode
} from "./";

export class Message {
  public type: string;
  public payload: MessagePayload;
  public context: Context;

  constructor({ type, payload }: MessageData, context: Context) {
    this.type = type;
    this.payload = payload;
    this.context = context;
  }

  static make = (message: MessageData, context: Context) =>
    new Message(message, context);

  toJson = (): MessageWithContext => ({
    type: this.type,
    payload: this.payload,
    context: this.context
  });

  toString = (): string => encode(this.toJson());
}
