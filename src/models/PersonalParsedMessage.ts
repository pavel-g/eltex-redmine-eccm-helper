import {User} from "./User";

export class PersonalParsedMessage {
  sender: {
    id: number,
    name: string
  };
  message: string;
  recipients: User[];
}