import {Activity} from "../models/weeklyreport/Activity";
import {ReportActivitiesByUsers, ReportActivity, ReportIssue} from "../models/weeklyreport/Report";
import {Issue} from "../models/redmine/Issue";
import {UsersService} from "../services/UsersService";
import {forOwn, orderBy} from "lodash";

export class ActivitiesHelper {

  constructor(
    private activities: Activity[],
    private issues: Issue[],
    private usersService: UsersService
  ) {
  }

  async getReport(): Promise<Record<string, ReportActivitiesByUsers>> {
    const res: Record<string, ReportActivitiesByUsers> = {};
    for(let i = 0; i < this.activities.length; i++) {
      const activity = this.activities[i];
      if (!res[activity.recipient.name]) {
        res[activity.recipient.name] = {
          user: await this.usersService.findUserByFullname(activity.recipient.name),
          by_issues: {}
        };
      }
      if (!res[activity.recipient.name].by_issues[activity.issue_id]) {
        const issue = this.issues.find(i => i.id == activity.issue_id) || null;
        res[activity.recipient.name].by_issues[activity.issue_id] = {
          issue: this.createReportIssue(issue),
          activities: []
        };
      }
      res[activity.recipient.name].by_issues[activity.issue_id].activities.push(activity);
    }
    forOwn(res, (reportActivitiesByUsers: ReportActivitiesByUsers, i) => {
      forOwn(reportActivitiesByUsers.by_issues, (reportActivity: ReportActivity, j) => {
        reportActivity.activities = orderBy(reportActivity.activities, (activity: Activity) => {
          return activity.created_on;
        });
      });
    });
    return res;
  }

  private createReportIssue(issue?: Issue|null): ReportIssue|null {
    if (!issue) return null;
    return {
      issue_id: issue.id,
      subject: issue.subject,
      tracker_name: issue.tracker.name,
      status: issue.status.name
    };
  }

}