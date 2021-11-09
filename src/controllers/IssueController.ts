import {Controller} from "@tsed/di";
import {IssueEnhanceService} from "../services/IssueEnhanceService";
import {Post, Returns} from "@tsed/schema";
import {BodyParams} from "@tsed/common";
import {PersonalMessagesRequest} from "../models/PersonalMessagesRequest";
import {PersonalMessagesService} from "../services/PersonalMessagesService";
import {PersonalMessagesForTelegramService} from "../services/PersonalMessagesForTelegramService";

@Controller("/issue")
export class IssueController {

  constructor(
    private issueEnhanceService: IssueEnhanceService,
    private personalMessagesService: PersonalMessagesService,
    private personalMessagesForTelegramService: PersonalMessagesForTelegramService
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

}