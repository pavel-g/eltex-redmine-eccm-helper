import {Service} from "@tsed/di";
import {UsersService} from "./UsersService";
import {StatusesService} from "./StatusesService";
import {StatusRulesService} from "./StatusRulesService";
import {FieldConverters} from "./fieldconverters/FieldConverters";

const jsonpath = require('jsonpath');

@Service()
export class IssueEnhanceService {

  constructor(
    private usersService: UsersService,
    private statusesService: StatusesService,
    private statusRulesService: StatusRulesService,
    private fieldConverters: FieldConverters
  ) {
  }

  async enhanceIssue(issue: any): Promise<any> {
    issue = await this.enhanceCustomFields(issue);
    issue = await this.calcCurrentUser(issue);
    issue = await this.enhanceJournals(issue);
    return issue;
  }

  async enhanceCustomFields(issue: any): Promise<any> {
    const statusRules = await this.statusRulesService.getStatusRules();
    for (let i = 0; i < statusRules.length; i++) {
      const statusRule = statusRules[i];
      const query = statusRule.query;
      const value = jsonpath.value(issue, query);
      const converter = this.fieldConverters.getConverter(statusRule.converter);
      const convertedValue = await converter.convert(value);
      issue[statusRule.metadataPropertyName] = convertedValue;
    }
    return issue;
  }

  async calcCurrentUser(issue: any): Promise<any> {
    const currentStatusName = issue?.status?.name;
    if (typeof currentStatusName !== 'string') return issue;
    const statusRules = await this.statusRulesService.getStatusRules();
    const rule = statusRules.find(sr => {
      return (sr.statuses.indexOf(currentStatusName) >= 0 && sr.converter === 'user')
    });
    if (!rule) return issue;
    issue.current_user = issue[rule.metadataPropertyName];
    return issue;
  }

  async enhanceJournals(issue: any): Promise<any> {
    if (!issue?.journals || issue?.journals?.length <= 0) return issue;
    const timestampConverter = this.fieldConverters.getConverter('timestamp');
    for (let i = 0; i < issue.journals.length; i++) {
      const journal = issue.journals[i];
      if (!journal) continue;
      journal.created_on_timestamp = await timestampConverter.convert(journal.created_on);
    }
    return issue;
  }

}