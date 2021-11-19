import {Service} from "@tsed/di";
import {NewJournalsService} from "./NewJournalsService";
import {StatusesService} from "./StatusesService";
import Handlebars from 'handlebars';
import {UserConverter} from "./fieldconverters/UserConverter";
import {Change} from "../models/Change";
import {RedmineUrlConverter} from "./fieldconverters/RedmineUrlConverter";
import {TimestampConverter} from "./fieldconverters/TimestampConverter";
import {RedmineChangesParamsService} from "./RedmineChangesParamsService";
import {EnvsConsts} from "../consts/EnvsConsts";
import {ChangeMessage} from "../models/ChangeMessage";

@Service()
export class ChangesAnalizeService {

  private newIssueStatus: string = "New";

  constructor(
    private newJournalsService: NewJournalsService,
    private statusesService: StatusesService,
    private userConverter: UserConverter,
    private redmineUrlConverter: RedmineUrlConverter,
    private timestampConverter: TimestampConverter,
    private redmineChangesParamsService: RedmineChangesParamsService
  ) {
    if (typeof process.env[EnvsConsts.NEW_ISSUE_STATUS.toString()] === 'string') {
      this.newIssueStatus = process.env[EnvsConsts.NEW_ISSUE_STATUS.toString()] as string;
    }
  }

  async getChanges(issue: any, after: any): Promise<any> {
    const newJournals = await this.newJournalsService.getMessagesAfter(issue, after)
    if (newJournals.length <= 0) return [];
    const promises = newJournals.map(async journal => this.getMessagesForChangeStatus(issue, journal))
    const allChanges = await Promise.all(promises);
    return allChanges.filter(c => c);
  }

  private async getMessagesForChangeStatus(issue: any, journal: any): Promise<Change|null> {
    const statusChangeDetails = this.getStatusChangeDetails(journal);
    if (!statusChangeDetails) null;
    const change: Change = {
      initiator: await this.userConverter.convert(journal?.user?.id),
      dev: await this.userConverter.convert(issue?.dev?.id),
      qa: await this.userConverter.convert(issue?.qa?.id),
      cr: await this.userConverter.convert(issue?.cr?.id),
      current_user: await this.userConverter.convert(issue?.current_user?.id),
      author: await this.userConverter.convert(issue?.author?.id),
      old_status: await this.statusesService.findStatusById(statusChangeDetails.old_value),
      new_status: await this.statusesService.findStatusById(statusChangeDetails.new_value),
      issue_id: issue.id,
      issue_url: await this.redmineUrlConverter.convert(issue.id),
      issue_tracker: issue.tracker?.name || '',
      issue_subject: issue.subject || '',
      created_on: journal.created_on,
      created_on_timestamp: await this.timestampConverter.convert(journal.created_on),
      journal_note: journal.notes || '',
      messages: []
    };
    const messages = await this.generateMessages(statusChangeDetails, change);
    change.messages = messages;
    return change;
  }

  async getMessagesForNewIssue(issue: any): Promise<Change|null> {
    const change: Change = {
      initiator: await this.userConverter.convert(issue?.author?.id),
      dev: await this.userConverter.convert(issue?.dev?.id),
      qa: await this.userConverter.convert(issue?.qa?.id),
      cr: await this.userConverter.convert(issue?.cr?.id),
      current_user: await this.userConverter.convert(issue?.current_user?.id),
      author: await this.userConverter.convert(issue?.author?.id),
      old_status: null,
      new_status: await this.statusesService.findStatusById(issue?.status?.id),
      issue_id: issue.id,
      issue_url: await this.redmineUrlConverter.convert(issue.id),
      issue_tracker: issue.tracker?.name || '',
      issue_subject: issue.subject || '',
      created_on: issue?.created_on,
      created_on_timestamp: await this.timestampConverter.convert(issue?.created_on),
      journal_note: '',
      messages: []
    };

    const messageParams = await this.redmineChangesParamsService.findChangeParams(this.newIssueStatus, this.newIssueStatus);

    let filledMessages: any[] = await Promise.all(messageParams.messages.map(async (messageParams: any) => {
      return await this.generateMessage(messageParams, change);
    }));
    filledMessages = filledMessages.filter(m => m);

    change.messages.push(...filledMessages);

    return change;
  }

  private getStatusChangeDetails(journal: any): any|null {
    const details = journal?.details;
    if (!details || details.length <= 0) return false;
    return ((journal.details as any[]).find((d: any) => {
      return d.name === 'status_id'
    })) || null;
  }

  private async generateMessages(detail: any, change: any): Promise<any[]> {
    const oldStatus = await this.statusesService.findStatusById(detail.old_value);
    const newStatus = await this.statusesService.findStatusById(detail.new_value);
    if (!oldStatus || !newStatus) [];
    const changeParams = await this.redmineChangesParamsService.findChangeParams(oldStatus.name, newStatus.name);
    if (!changeParams || !changeParams.messages) [];
    const filledMessages = await Promise.all(changeParams.messages.map(async (messageParams: any) => {
      return await this.generateMessage(messageParams, change);
    }));
    return filledMessages.filter(m => m);
  }

  private async generateMessage(messageParams: any, change: any): Promise<any> {
    if (!messageParams) return;
    const recipientUser = await this.userConverter.convert(change[messageParams.recipient]?.id);
    if (!recipientUser) return;

    let changeMessage = null;
    if (messageParams.changes_message) {
      const changeMessageTemplate = Handlebars.compile(messageParams.changes_message);
      changeMessage = changeMessageTemplate(change);
    }

    let notificationMessage = null;
    if (messageParams.notification_message) {
      const notificationMessageTemplate = Handlebars.compile(messageParams.notification_message);
      notificationMessage = notificationMessageTemplate(change);
    }

    return {
      recipient: recipientUser,
      change_message: changeMessage,
      notification_message: notificationMessage
    };
  }

}