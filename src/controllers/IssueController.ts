import {Controller} from "@tsed/di";
import {IssueEnhanceService} from "../services/IssueEnhanceService";
import {Post, Returns} from "@tsed/schema";
import {BodyParams} from "@tsed/common";
import {PersonalMessagesRequest} from "../models/PersonalMessagesRequest";
import {PersonalMessagesService} from "../services/PersonalMessagesService";
import {PersonalMessagesForTelegramService} from "../services/PersonalMessagesForTelegramService";
import {ChangesAnalizeService} from "../services/ChangesAnalizeService";
import {ChangesMessagesForTelegramService} from "../services/ChangesMessagesForTelegramService";

@Controller("/issue")
export class IssueController {

  constructor(
    private issueEnhanceService: IssueEnhanceService,
    private personalMessagesService: PersonalMessagesService,
    private personalMessagesForTelegramService: PersonalMessagesForTelegramService,
    private changesAnalizeService: ChangesAnalizeService,
    private changesMessagesForTelegramService: ChangesMessagesForTelegramService,
  ) {
  }

  @Post("/enhance")
  @Returns(200)
  async enhanceIssue(@BodyParams() issue: any): Promise<any> {
    return await this.issueEnhanceService.enhanceIssue(issue);
  }

  @Post('/personal-messages')
  @Returns(200)
  async getPersonalMessages(@BodyParams() params: PersonalMessagesRequest): Promise<any> {
    return await this.personalMessagesService.getMessagesAfter(params.issue, params.after_date || params.after_timestamp);
  }

  @Post('/personal-messages/for-telegram')
  @Returns(200)
  async getPersonalMessagesForTelegram(@BodyParams() params: PersonalMessagesRequest): Promise<any> {
    const messages = await this.personalMessagesService.getMessagesAfter(
      params.issue,
      params.after_date || params.after_timestamp
    );
    const messagesForSending = await this.personalMessagesForTelegramService.getTelegramMessages(params.issue, messages);
    return messagesForSending;
  }

  @Post('/changes')
  @Returns(200)
  async getChanges(@BodyParams() params: PersonalMessagesRequest): Promise<any> {
    return await this.changesAnalizeService.getChanges(params.issue, params.after_date || params.after_timestamp);
  }

  @Post('/changes/for-telegram')
  @Returns(200)
  async getChangesForTelegram(@BodyParams() params: PersonalMessagesRequest): Promise<any> {
    const changes = await this.changesAnalizeService.getChanges(
      params.issue,
      params.after_date || params.after_timestamp
    );
    const res = await this.changesMessagesForTelegramService.getTelegramMessages(
      params.issue,
      changes
    );
    return res;
  }

}