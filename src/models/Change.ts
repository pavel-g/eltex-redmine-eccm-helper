import {User} from "./User";
import {ChangeMessage} from "./ChangeMessage";

export class Change {
  initiator?: User;
  dev?: User;
  cr?: User;
  qa?: User;
  current_user?: User;
  author?: User;
  issue_id: number;
  issue_url: string;
  issue_tracker: string;
  issue_subject: string;
  journal_note?: string;
  old_status?: {
    id?: number;
    name?: string;
  } | null;
  new_status?: {
    id?: number;
    name?: string;
  };
  created_on: string;
  created_on_timestamp: number|null;
  messages: ChangeMessage[]
}