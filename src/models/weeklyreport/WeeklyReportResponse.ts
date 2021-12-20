import {Format, JsonFormatTypes, Property} from "@tsed/schema";

export class WeeklyReportResponse {

  @Format(JsonFormatTypes.DATE_TIME)
  @Property()
  from: string;

  @Format(JsonFormatTypes.DATE_TIME)
  @Property()
  to: string;

  @Property()
  data: any[];

}