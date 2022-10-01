import { messageTracker } from "./messageTracker";
import { Stats, writeFile } from "fs";
import { config } from "../config";
import { Event, messageSend } from "../eventTypes";
import { fileChangeEventToMsg } from "./messageGenerators";
import { Message } from "../interfaces";
import { Subject } from "rxjs";

export function messageHandler(messages$: Subject<Event>, msg: Message, paths: Map<string, Stats>) {
  let incoming;

  try {
    incoming = JSON.parse(msg.toString());
  } catch (err) {
    return console.log(err);
  }
  console.log(incoming);
  if (incoming.id == undefined) return;

  if (incoming.result) {
    const request = messageTracker.get(incoming.id);
    if (request?.method && request.method == "getDefinitionFile" && incoming.result) {
      writeFile(config.get("definitionFile").location, incoming.result, (err) => {
        if (err) return console.log(err);
      });
    }

    if (request?.method && request.method == "getFileNames" && incoming.result) {
      const gameFiles = incoming.result.map((file: string) => removeLeadingSlash(file));

      paths.forEach((stats, fileName) => {
        if (!stats.isDirectory() && !gameFiles.includes(fileName))
          messages$.next(messageSend(fileChangeEventToMsg({ path: fileName })));
      });
    }
  }
}

function removeLeadingSlash(path: string) {
  const reg = /^\//;
  return path.replace(reg, "");
}
