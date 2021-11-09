import {Service} from "@tsed/di";
import axios from "axios";
import {StatusRule} from "../models/StatusRule";

@Service()
export class StatusRulesService {

  private statusRules: StatusRule[]|undefined|null;

  private couchStatusRulesUrlPrefix: string;
  private couchStatusRulesDbUser: string;
  private couchStatusRulesDbPassword: string;

  constructor() {
    this.couchStatusRulesUrlPrefix = process.env['COUCHDB_STATUS_RULES_URL_PREFIX'] || '';
    this.couchStatusRulesDbUser = process.env['COUCHDB_STATUS_RULES_DB_USER'] || '';
    this.couchStatusRulesDbPassword = process.env['COUCHDB_STATUS_RULES_DB_PASSWORD'] || '';
  }

  async getStatusRules(): Promise<StatusRule[]> {
    if (typeof this.statusRules === 'undefined') {
      const url = `${this.couchStatusRulesUrlPrefix}/_find`;
      const resp = await axios.post(
        url,
        {
          'selector': {},
          'limit': 9999
        },
        {auth: this.getAuth()}
      );
      if (resp?.data?.docs?.length > 0) {
        this.statusRules = resp.data.docs;
      } else {
        this.statusRules = [];
      }
    }
    return this.statusRules || [];
  }

  private getAuth(): {username: string, password: string} {
    return {
      username: this.couchStatusRulesDbUser,
      password: this.couchStatusRulesDbPassword
    };
  }

}