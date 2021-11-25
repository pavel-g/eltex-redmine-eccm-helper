import {Service} from "@tsed/di";
import {TimestampConverter} from "./fieldconverters/TimestampConverter";
import {EnvsConsts} from "../consts/EnvsConsts";

@Service()
export class NewJournalsService {

  private additionalSilenceTime: number = 0;

  constructor(
    private timestampConverter: TimestampConverter
  ) {
    if (process.env[EnvsConsts.ADDITIONAL_SILENCE_TIME.toString()]) {
      this.additionalSilenceTime = Number(process.env[EnvsConsts.ADDITIONAL_SILENCE_TIME.toString()] || 0)
    }
  }

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
      if (journalTimestamp <= afterTimestamp + this.additionalSilenceTime) continue;
      newJournals.push(journal);
    }
    return newJournals;
  }

}