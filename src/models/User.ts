import {Property} from "@tsed/schema";

export class User {
  @Property()
  id?: number;

  @Property()
  firstname?: string;

  @Property()
  lastname?: string;

  @Property()
  name?: string;

  @Property()
  telegram_chat_id?: string;

  @Property()
  message_types?: string[]|null;
}