import {Service} from "@tsed/di";
import {TimestampConverter} from "./fieldconverters/TimestampConverter";

@Service()
export class NewJournalsService {

  constructor(
    private timestampConverter: TimestampConverter
  ) {}

  async getMessagesAfter(issue: any, after: any): Promise<any[]> {
    if (!(issue?.journals?.length > 0)) return [];
    let afterTimestamp: number = -1;
    if (typeof after === 'string') {
      afterTimestamp = await this.timestampConverter.convert(after) || -1;
    } else if (typeof after === 'number') {
      afterTimestamp = after;
    }
    if (afterTimestamp < 0) return [];
    const newJournals: any[] = [];
    for (let i = 0; i < issue.journals.length; i++) {
      const journal = issue.journals[i];
      const journalTimestamp = await this.timestampConverter.convert(journal?.created_on || null) || -1;
      if (journalTimestamp <= afterTimestamp) continue;
      newJournals.push(journal);
    }
    return newJournals;
  }

}