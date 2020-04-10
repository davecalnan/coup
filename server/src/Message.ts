import {
  MessagePayload,
  MessageData,
  MessageContext,
  MessageWithContext,
  encode,
} from "./";

export class Message {
  public type: string;
  public payload: MessagePayload;
  public context: MessageContext;

  constructor({ type, payload }: MessageData, context: MessageContext) {
    this.type = type;
    this.payload = payload;
    this.context = context;
  }

  static make = (message: MessageData, context: MessageContext) =>
    new Message(message, context);

  toJson = (): MessageWithContext => ({
    type: this.type,
    payload: this.payload,
    context: this.context,
  });

  toString = (): string => encode(this.toJson());
}
