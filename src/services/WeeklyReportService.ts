import {Service} from "@tsed/di";
import axios from "axios";
import {EnvsConsts} from "../consts/EnvsConsts";
import {Activity} from "../models/weeklyreport/Activity";
import {CouchDbFindResponse} from "../models/CouchDbFindResponse";
import {Issue} from "../models/redmine/Issue";
import {ReportMin} from "../models/weeklyreport/Report";
import {ActivitiesHelper} from "../helpers/ActivitiesHelper";
import {UsersService} from "./UsersService";

@Service()
export class WeeklyReportService {

  private closedStatues: string[] = [
    "Closed",
    "Testing",
    "Resolved"
  ];

  private changesDbParams = {
    url: '',
    username: '',
    password: ''
  };

  private issuesDbParams = {
    url: '',
    username: '',
    password: ''
  };

  constructor(
    private usersService: UsersService
  ) {
    this.changesDbParams.url = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_URL_PREFIX.toString()] || '';
    this.changesDbParams.username = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_DB_USER.toString()] || '';
    this.changesDbParams.password = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_DB_PASSWORD.toString()] || '';

    this.issuesDbParams.url = process.env[EnvsConsts.COUCHDB_REDMINE_ISSUES_URL_PREFIX.toString()] || '';
    this.issuesDbParams.username = process.env[EnvsConsts.COUCHDB_REDMINE_ISSUES_DB_USER.toString()] || '';
    this.issuesDbParams.password = process.env[EnvsConsts.COUCHDB_REDMINE_ISSUES_DB_PASSWORD.toString()] || '';

    if (typeof process.env[EnvsConsts.CLOSED_STATUES_FOR_WEEKLY_REPORT.toString()] === 'string') {
      const closedIssuesEnvValue = process.env[EnvsConsts.CLOSED_STATUES_FOR_WEEKLY_REPORT.toString()] || '';
      this.closedStatues = closedIssuesEnvValue.split(",").map(s => s.trim());
    }
  }

  async getReport(from: Date, to: Date): Promise<ReportMin|null> {
    const activities = await this.getWeeklyActivities(from, to);
    if (!activities) return null;
    const uniqIssueIds = this.getUniqIssues(activities);
    const issues = await this.getIssues(uniqIssueIds);
    const closedIssues = await this.getClosedIssues(uniqIssueIds);

    const activitiesHelper = new ActivitiesHelper(activities, issues, this.usersService);

    const reportMin: ReportMin = {
      closed_issues: closedIssues.map(issue => {
        return {
          issue_id: issue.id,
          subject: issue.subject,
          tracker_name: issue.tracker.name,
          status: issue.status.name
        };
      }),
      by_users: await activitiesHelper.getReport()
    };

    return reportMin;
  }

  private async getWeeklyActivities(from: Date, to: Date): Promise<Activity[]|null> {
    const fromTimestamp = from.getTime();
    const toTimestamp = to.getTime();
    const url = `${this.changesDbParams.url}/_find`;
    const request = {
      "selector": {
        "created_on_timestamp": {
          "$gte": fromTimestamp,
          "$lt": toTimestamp
        }
      },
      "fields": [
        "recipient.name",
        "issue_id",
        "created_on",
        "change_message"
      ],
      "limit": 999999
    };
    const params = {
      auth: {
        username: this.changesDbParams.username,
        password: this.changesDbParams.password
      }
    }
    const resp = await axios.post<CouchDbFindResponse<Activity>>(url, request, params);
    if (!(resp.data.docs.length > 0)) return null;
    return resp.data.docs;
  }

  private getUniqIssues(activities: Activity[]): number[] {
    const res: number[] = [];
    for (let i = 0; i < activities.length; i++) {
      const item = activities[i];
      if (!res.includes(item.issue_id)) {
        res.push(item.issue_id);
      }
    }
    return res;
  }

  private async getClosedIssues(issues: number[]): Promise<Issue[]> {
    const url = `${this.issuesDbParams.url}/_find`;
    const request = {
      "selector": {
        "status.name": {
          "$in": this.closedStatues
        },
        "id": {
          "$in": issues
        }
      },
      "limit": 999999
    };
    const params = {
      auth: {
        username: this.issuesDbParams.username,
        password: this.issuesDbParams.password
      }
    };
    const resp = await axios.post<CouchDbFindResponse<Issue>>(url, request, params);
    if (!(resp?.data?.docs?.length > 0)) return [];
    return resp.data.docs;
  }

  private async getIssues(issues: number[]): Promise<Issue[]> {
    const url = `${this.issuesDbParams.url}/_find`;
    const request = {
      "selector": {
        "id": {
          "$in": issues
        }
      },
      "limit": 999999
    };
    const params = {
      auth: {
        username: this.issuesDbParams.username,
        password: this.issuesDbParams.password
      }
    };
    const resp = await axios.post<CouchDbFindResponse<Issue>>(url, request, params);
    if (!(resp?.data?.docs?.length > 0)) return [];
    return resp.data.docs;
  }

}