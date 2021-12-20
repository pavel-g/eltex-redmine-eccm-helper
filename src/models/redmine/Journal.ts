import {IdAndName} from "./IdAndName";
import {JournalDetail} from "./JournalDetail";

export type Journal = {
  id: number;
  user: IdAndName;
  notes: string;
  created_on: string;
  details?: JournalDetail[];
};