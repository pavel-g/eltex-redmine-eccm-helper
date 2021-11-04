import {Property} from "@tsed/schema";

export class User {
  @Property()
  id?: number;

  @Property()
  firstname?: string;

  @Property()
  lastname?: string;

  @Property()
  telegram_chat_id?: string;
}