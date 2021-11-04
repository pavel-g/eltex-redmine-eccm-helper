import {Property} from "@tsed/schema";

export class Version {
  @Property()
  version: String;

  @Property()
  name: String;
}