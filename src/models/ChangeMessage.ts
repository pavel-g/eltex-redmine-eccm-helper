import {User} from "./User";

export type ChangeMessage = {
  changes_message?: string|null;
  notification_message?: string|null;
  recipient?: User|null;
};