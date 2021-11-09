import {Property} from "@tsed/schema";

export class PersonalMessagesRequest {
  @Property()
  after_date?: string;
  @Property()
  after_timestamp?: number;
  @Property()
  issue: any;
}