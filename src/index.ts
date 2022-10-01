import { setupWatch } from "./fileWatch";
import { config, loadConfig } from "./config";
import { setupSocket } from "./networking/webSocket";
import {
  fileChangeEventToMsg,
  fileRemovalEventToMsg,
  requestFilenames,
  requestDefinitionFile,
} from "./networking/messageGenerators";
import { Event, messageSend, isMessageReceived, isConnectionMade, isFileChanged, isFileDeleted } from "./eventTypes";
import { messageHandler } from "./networking/messageHandler";
import { filter, Subject } from "rxjs";

export async function start() {
  const messages$ = new Subject<Event>();
  loadConfig();
  const watch = await setupWatch(messages$);
  const socket = setupSocket(messages$);

  // Add a handler for received messages.
  messages$.pipe(filter(isMessageReceived)).subscribe(({ msg }) => messageHandler(messages$, msg, watch.paths));

  // Add a handler for when a connection to a game is made.
  messages$.pipe(filter(isConnectionMade)).subscribe(() => {
    console.log("Connection made!");

    if (config.get("definitionFile").update) {
      messages$.next(messageSend(requestDefinitionFile()));
    }

    if (config.get("pushAllOnConnection")) {
      const extensions = config.get("allowedFiletypes");
      for (const path of watch.paths.keys()) {
        if (extensions.some((extension) => path.endsWith(extension)))
          messages$.next(messageSend(fileChangeEventToMsg({ path })));
      }
    } else {
      // Upload missing files to the game.
      messages$.next(messageSend(requestFilenames()));
    }
  });

  // Add a handler for changed files.
  messages$.pipe(filter(isFileChanged)).subscribe(({ fileEvent }) => {
    if (!config.get("quiet")) console.log(fileEvent.path + " changed");
    messages$.next(messageSend(fileChangeEventToMsg(fileEvent)));
  });

  // Add a handler for removed files, if allowed.
  if (config.get("allowDeletingFiles"))
    messages$.pipe(filter(isFileDeleted)).subscribe(({ fileEvent }) => {
      messages$.next(messageSend(fileRemovalEventToMsg(fileEvent)));
    });

  console.log(`Server is ready, running on ${config.get("port")}!`);

  process.on("SIGINT", function () {
    console.log("Shutting down!");

    watch.close();
    socket.close();
    process.exit();
  });
}
