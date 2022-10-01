import type { Stats } from "fs";

export interface Message {
  id: string;
  method?: string;
  jsonrpc: string;
  params?: object;
}

export interface FilePath {
  path: string;
}

export interface File extends FilePath {
  stats: Stats;
}
