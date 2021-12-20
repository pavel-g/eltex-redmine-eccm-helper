import {IdAndName} from "./IdAndName";
import {CustomField} from "./CustomField";

export type Issue = {
  id: number;
  project: IdAndName;
  tracker: IdAndName;
  status: IdAndName;
  priority: IdAndName;
  author: IdAndName;
  category: IdAndName;
  fixed_version: IdAndName;
  subject: string;
  description: string;
  start_date: string;
  done_ratio: number;
  spent_hours: number;
  total_spent_hours: number;
  custom_fields: CustomField[];
  created_on: string;
  updated_on?: string;
  closed_on?: string;
  relations?: Record<string, any>[];
  
}