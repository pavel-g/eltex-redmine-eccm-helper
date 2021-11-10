import {Service} from "@tsed/di";
import {PersonalParsedMessage} from "../models/PersonalParsedMessage";
import {PersonalMessage} from "../models/PersonalMessage";
import handlebars from "handlebars";
import {RedmineUrlConverter} from "./fieldconverters/RedmineUrlConverter";
import {MessangersConsts} from "../consts/MessangersConsts";
import {MessageTypesConsts} from "../consts/MessageTypesConsts";
import {EnvsConsts} from "../consts/EnvsConsts";

@Service()
export class PersonalMessagesForTelegramService {

  private messageTemplate: string = "{{issue_url}} {{sender_name}}:\n\n{{message}}";

  constructor(
    private redmineUrlConverter: RedmineUrlConverter
  ) {
    const TELEGRAM_MESSAGE_TEMPLATE = EnvsConsts.TELEGRAM_MESSAGE_TEMPLATE.toString();
    if (typeof process.env[TELEGRAM_MESSAGE_TEMPLATE] === 'string') {
      this.messageTemplate = process.env[TELEGRAM_MESSAGE_TEMPLATE] || "";
    }
  }

  async getTelegramMessages(issue: any, personalMessages: PersonalParsedMessage[]): Promise<PersonalMessage[]> {
    const res: PersonalMessage[] = [];
    for (let i = 0; i < personalMessages.length; i++) {
      const personalMessage = personalMessages[i];
      const issueUrl = await this.redmineUrlConverter.convert(issue.id);
      const resMessage = this.formatMessage({
        issue_url: issueUrl,
        sender_name: personalMessage.sender.name,
        message: personalMessage.message
      });
      for (let j = 0; j < personalMessage.recipients.length; j++) {
        const recipient = personalMessage.recipients[j];
        if (personalMessage.sender.id == recipient.id) continue;
        if (!recipient.telegram_chat_id) continue;
        res.push({
          messanger: MessangersConsts.TELEGRAM.toString(),
          message_type: MessageTypesConsts.PERSONAL_NOTIFICATION_FROM_ISSUE.toString(),
          message: resMessage,
          recipient_id: recipient.telegram_chat_id
        });
      }
    }
    return res;
  }

  private formatMessage(src: any): string {
    const template = handlebars.compile(this.messageTemplate);
    return template(src);
  }

}