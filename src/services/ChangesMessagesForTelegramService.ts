import {Service} from "@tsed/di";
import {PersonalMessage} from "../models/PersonalMessage";
import {MessangersConsts} from "../consts/MessangersConsts";
import {MessageTypesConsts} from "../consts/MessageTypesConsts";
import {UsersService} from "./UsersService";

@Service()
export class ChangesMessagesForTelegramService {

  constructor(private usersService: UsersService) {
  }

  async getTelegramMessages(changesMessages: any[]): Promise<PersonalMessage[]> {
    const res: PersonalMessage[] = [];
    for (let i = 0; i < changesMessages.length; i++) {
      const changeMessage = changesMessages[i];
      if (!changeMessage.messages) continue;
      for (let j = 0; j < changeMessage.messages.length; j++) {
        const message = changeMessage.messages[j];
        if (!message || !message.notification_message || !message.recipient?.id) continue;
        const user = await this.usersService.findUserById(message.recipient.id);
        const messageType = MessageTypesConsts.CHANGE_NOTIFICATION_FROM_ISSUE.toString();
        if (
          !user ||
          !user.telegram_chat_id ||
          !user.message_types ||
          user.message_types.indexOf(messageType) < 0 ||
          changeMessage.initiator?.id == message.recipient?.id
        ) continue;
        res.push({
          messanger: MessangersConsts.TELEGRAM.toString(),
          message_type: messageType,
          message: message.notification_message,
          recipient_id: user.telegram_chat_id
        });
      }
    }
    return res;
  }

}