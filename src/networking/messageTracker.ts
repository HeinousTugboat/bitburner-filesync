import type { Message } from "../interfaces";

class MessageTracker {
  data = new Map<string, Message>();
  #maxLength = 200;

  push(msg: Message) {
    this.data.set(msg.id, msg);

    if (this.data.size > this.#maxLength) {
      const [firstKey] = this.data.keys();
      this.data.delete(firstKey);
    }
  }

  get(index: string) {
    return this.data.get(index);
  }
}

export const messageTracker = new MessageTracker();
