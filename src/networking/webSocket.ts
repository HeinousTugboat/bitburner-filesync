import { filter, fromEvent, Subject } from "rxjs";
import { WebSocketServer } from "ws";
import { config } from "../config";
import { Event, connection, isMessageSend, isMessage, isWebSocket, messageReceived } from "../eventTypes";
import { Message } from "../interfaces";
import { requestDefinitionFile } from "./messageGenerators";
import { messageTracker } from "./messageTracker";

function sendMessage(ws: WebSocket, msg: Message) {
  messageTracker.push(msg);
  ws.send(JSON.stringify(msg));
}

export function setupSocket(messages$: Subject<Event>) {
  const wss = new WebSocketServer({ port: config.get("port") });

  const connection$ = fromEvent(wss, "connection", isWebSocket).subscribe((ws: WebSocket) => {
    messages$.pipe(filter(isMessageSend)).subscribe((event) => sendMessage(ws, event.msg));

    messages$.next(connection());

    const message$ = fromEvent(ws, "message", isMessage).subscribe((msg) => messages$.next(messageReceived(msg)));
  });

  return wss;
}
