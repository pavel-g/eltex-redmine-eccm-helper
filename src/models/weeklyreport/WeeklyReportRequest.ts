import {Property} from "@tsed/schema";

export class WeeklyReportRequest {

  @Property()
  from: string;

  @Property()
  to: string;

}