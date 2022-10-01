import type { FilePath, Message } from "./interfaces";

export enum EventType {
  ConnectionMade = "ConnectionMade",
  FileChanged = "FileChanged",
  FileDeleted = "FileDeleted",
  MessageReceived = "MessageReceived",
  MessageSend = "MessageSend",
}

// Event Interfaces
export interface ConnectionEvent {
  type: EventType.ConnectionMade;
}

export interface MessageEvent {
  type: EventType.MessageReceived | EventType.MessageSend;
  msg: Message;
}

export interface FileChangeEvent {
  type: EventType.FileChanged | EventType.FileDeleted;
  fileEvent: FilePath;
}

export type Event = ConnectionEvent | MessageEvent | FileChangeEvent;

// Event Creators
export function connection(): ConnectionEvent {
  return { type: EventType.ConnectionMade };
}

export function messageSend(msg: Message): MessageEvent {
  return {
    type: EventType.MessageSend,
    msg,
  };
}

export function messageReceived(msg: Message): MessageEvent {
  return {
    type: EventType.MessageReceived,
    msg,
  };
}

export function fileChanged(fileEvent: FilePath): FileChangeEvent {
  return {
    type: EventType.FileChanged,
    fileEvent,
  };
}

export function fileDeleted(fileEvent: FilePath): FileChangeEvent {
  return {
    type: EventType.FileDeleted,
    fileEvent,
  };
}

// Event Filters
export function isConnectionMade(event: Event): event is ConnectionEvent {
  return event.type === EventType.ConnectionMade;
}

export function isMessageSend(event: Event): event is MessageEvent {
  return event.type === EventType.MessageSend;
}

export function isMessageReceived(event: Event): event is MessageEvent {
  return event.type === EventType.MessageReceived;
}

export function isFileChanged(event: Event): event is FileChangeEvent {
  return event.type === EventType.FileChanged;
}

export function isFileDeleted(event: Event): event is FileChangeEvent {
  return event.type === EventType.FileDeleted;
}

// fromEvent selectors
export function isMessage(msg: Message): Message {
  return msg;
}

export function isWebSocket(ws: WebSocket): WebSocket {
  return ws;
}
