import {Issue} from "../redmine/Issue";
import {User} from "../User";
import {Activity} from "./Activity";

// export namespace SimpleReport {
//
//   export type ReportMin2 = {
//     closed_issues: ReportIssue[];
//     by_users: Record<string, ReportActivitiesByUsers>;
//   };
//
// }

export type ReportActivity = {
  issue?: ReportIssue|null;
  activities: Activity[];

};

export type ReportActivitiesByUsers = {
  user: User|null;
  by_issues: Record<number, ReportActivity>;
};

export type Report = {
  by_issues: Issue[];
  by_users: Record<string, ReportActivitiesByUsers>;
};

export type ReportIssue = {
  issue_id: number;
  tracker_name: string;
  subject: string;
  status: string;
};

export type ReportMin = {
  closed_issues: ReportIssue[];
  by_users: Record<string, ReportActivitiesByUsers>;
}