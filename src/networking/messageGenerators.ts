import { readFileSync } from "fs";
import { config } from "../config";
import { join } from "path";
import type { FilePath, Message } from "../interfaces";

let messageCounter = 0;

export function fileChangeEventToMsg({ path }: FilePath): Message {
  return {
    jsonrpc: "2.0",
    method: "pushFile",
    params: {
      server: "home",
      filename: addLeadingSlash(path),
      content: readFileSync(join(config.get("scriptsFolder"), path)).toString(),
    },
    id: (messageCounter++).toString(),
  };
}

export function fileRemovalEventToMsg({ path }: FilePath): Message {
  return {
    jsonrpc: "2.0",
    method: "deleteFile",
    params: {
      server: "home",
      filename: addLeadingSlash(path),
    },
    id: (messageCounter++).toString(),
  };
}

export function requestDefinitionFile(): Message {
  return {
    jsonrpc: "2.0",
    method: "getDefinitionFile",
    id: (messageCounter++).toString(),
  };
}

export function requestFilenames(): Message {
  return {
    jsonrpc: "2.0",
    method: "getFileNames",
    params: {
      server: "home",
    },
    id: (messageCounter++).toString(),
  };
}

function addLeadingSlash(path: string): string {
  const slashes = path.match("/");
  if (slashes) return `/${path}`;
  else return path;
}
