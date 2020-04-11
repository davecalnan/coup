import WebSocket from "ws";

import { ClientMessage, MessageData } from "./";

export const decode = (message: WebSocket.Data): ClientMessage => {
  const data = JSON.parse(message.toString());

  if (data?.type && typeof data?.payload === "object") {
    return data;
  }

  throw new TypeError(`Invalid message type.`);
};

export const encode = (message: any) => JSON.stringify(message, null, 2);

export const not = (needle: any) => (straw: any) => straw !== needle;

export const pickRandom = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

export type ShapeObjectValue =
  | string
  | "string"
  | "number"
  | "boolean"
  | "array"
  | ShapeObject;

export type ShapeObject = {
  [key: string]: ShapeObjectValue;
};

export type MessageShape = {
  type: string;
  payload: ShapeObject;
};

export const validateObjectShape = (
  object: { [key: string]: any },
  shape: ShapeObject
): boolean =>
  Object.entries(shape).every(([key, type]) => {
    if (type === "string" || type === "number" || type === "boolean") {
      return typeof object[key] === type;
    }

    if (type === "array") {
      return Array.isArray(object[key]);
    }

    if (typeof type === "string") {
      return object[key] === type;
    }

    if (typeof object[key] === "object") {
      return validateObjectShape(object[key], type);
    }
  });

export type PlayerShape = {
  name: "string";
  isActive: "boolean";
};

export const player: PlayerShape = {
  name: "string",
  isActive: "boolean",
};

export const validate = (
  message: MessageData,
  shape: MessageShape
): boolean => {
  const messageHasCorrectType = message.type === shape.type;
  if (!messageHasCorrectType) return false;

  const messageHasCorrectPayloadShape = validateObjectShape(
    message.payload,
    shape.payload
  );
  return messageHasCorrectPayloadShape;
};
