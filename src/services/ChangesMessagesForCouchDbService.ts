import {v4 as uuidv4} from "uuid";

export class ChangesMessagesForCouchDbService {

  async getCouchDbMessages(events: any[]): Promise<any[]> {
    const res = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event.messages) continue;
      for (let j = 0; j < event.messages.length; j++) {
        const message = event.messages[j];
        if (message.change_message) {
          const item = {...event, ...message};
          item.id = uuidv4().toString();
          delete item.messages;
          res.push(item);
        }
      }
    }
    return res;
  }

}