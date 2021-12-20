import {Service} from "@tsed/di";
import {WeeklyReportService} from "./WeeklyReportService";
import Handlebars from 'handlebars';

@Service()
export class WeeklyReportFormattedService {

  private template = `Закрытые задачи:

<ul>
{{#each closed_issues}}
  <li>{{this.tracker_name}} #{{this.issue_id}} ({{this.status}}) - {{this.subject}}</li>
{{/each}}
</ul>

Активность по исполнителям:

<ul>
{{#each by_users}}
  <li>
    {{this.user.name}}:
    <ul>
      {{#each by_issues}}
        <li>
          {{this.issue.tracker_name}} #{{this.issue.issue_id}} ({{this.issue.status}}) - {{this.issue.subject}}
          <ul>
            {{#each activities}}
              <li>{{this.created_on}}: {{this.change_message}}</li>
            {{/each}}
          </ul>
        </li>
      {{/each}}
    </ul>
  </li>
{{/each}}
</ul>`;

  constructor(private weeklyReportService: WeeklyReportService) {
  }

  async getReport(from: Date, to: Date, template?: string): Promise<string> {
    const report = await this.weeklyReportService.getReport(from, to);
    const targetTemplate = template || this.template;

    const compiledTemplate = Handlebars.compile(targetTemplate);

    return compiledTemplate ? compiledTemplate(report) : '';
  }

}