import {Service} from "@tsed/di";
import {TimestampConverter} from "./fieldconverters/TimestampConverter";
import {NewJournalsService} from "./NewJournalsService";
import {UsersService} from "./UsersService";
import {User} from "../models/User";
import {PersonalParsedMessage} from "../models/PersonalParsedMessage";

@Service()
export class PersonalMessagesService {

  private userNameRe: RegExp = /@([\wА-Яа-яЁё]+) ([\wА-Яа-яЁё]+)@/g;

  constructor(
    private timestampConverter: TimestampConverter,
    private newJournalsService: NewJournalsService,
    private usersService: UsersService
  ) {
    if (typeof process.env['USER_NAME_REGEXP'] === 'string') {
      this.userNameRe = new RegExp(process.env['USER_NAME_REGEXP']);
    }
  }

  async getMessagesAfter(issue: any, after: any): Promise<PersonalParsedMessage[]> {
    const newJournals = await this.newJournalsService.getMessagesAfter(issue, after);
    if (newJournals.length <= 0) return [];
    const messages = await Promise.all(newJournals.map(journal => this.getMessage(journal)));
    return messages;
  }

  private async getMessage(journal: any): Promise<PersonalParsedMessage> {
    const notes = journal?.notes || "";
    const results = notes.matchAll(this.userNameRe);
    const recipients: User[] = [];
    let result = results.next();
    while(!result.done) {
      if (result.value && result.value[1] && result.value[2]) {
        const firstname = result.value[1];
        const lastname = result.value[2];
        const recipientUser = await this.usersService.findUserByNames(firstname, lastname);
        if (recipientUser) {
          recipients.push({
            id: recipientUser.id,
            firstname: recipientUser.firstname,
            lastname: recipientUser.lastname,
            telegram_chat_id: recipientUser.telegram_chat_id
          });
        }
      }
      result = results.next();
    }
    return {
      sender: {
        id: journal?.user?.id || -1,
        name: journal?.user?.name || ""
      },
      message: notes,
      recipients: recipients
    };
  }

}