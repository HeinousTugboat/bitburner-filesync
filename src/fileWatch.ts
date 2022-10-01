import CheapWatch from "cheap-watch";
import { config } from "./config";
import { Event, fileChanged, fileDeleted } from "./eventTypes";
import { resolve } from "path";
import type { File } from "./interfaces";
import { filter, fromEvent, Subject } from "rxjs";

function fileFilter(file: File) {
  if (config.get("allowedFiletypes").some((extension) => file.path.endsWith(extension))) return true;
  if (file.stats.isDirectory()) return true;
  return false;
}

export async function setupWatch(messages$: Subject<Event>) {
  const watch = new CheapWatch({
    dir: config.get("scriptsFolder"),
    filter: fileFilter,
    watch: !config.get("dry"),
  });

  if (!config.get("quiet")) console.log("Watching folder", resolve(config.get("scriptsFolder")));

  fromEvent(watch, "+", (fileEvent: File) => fileEvent)
    .pipe(filter(({ stats }) => stats.isFile()))
    .subscribe((fileEvent) => messages$.next(fileChanged(fileEvent)));

  fromEvent(watch, "-", (fileEvent: File) => fileEvent)
    .pipe(filter(({ stats }) => stats.isFile()))
    .subscribe((fileEvent) => messages$.next(fileDeleted(fileEvent)));

  // Wait 'till filewatcher is ready to go
  await watch.init();

  if (config.get("dry")) {
    console.log("Watch would've synchronised:\n", watch.paths);
    process.exit();
  }

  return watch;
}
