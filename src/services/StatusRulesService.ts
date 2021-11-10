import {Service} from "@tsed/di";
import axios from "axios";
import {StatusRule} from "../models/StatusRule";
import {EnvsConsts} from "../consts/EnvsConsts";

@Service()
export class StatusRulesService {

  private statusRules: StatusRule[]|undefined|null;

  private couchStatusRulesUrlPrefix: string;
  private couchStatusRulesDbUser: string;
  private couchStatusRulesDbPassword: string;

  constructor() {
    this.couchStatusRulesUrlPrefix = process.env[EnvsConsts.COUCHDB_STATUS_RULES_URL_PREFIX.toString()] || '';
    this.couchStatusRulesDbUser = process.env[EnvsConsts.COUCHDB_STATUS_RULES_DB_USER.toString()] || '';
    this.couchStatusRulesDbPassword = process.env[EnvsConsts.COUCHDB_STATUS_RULES_DB_PASSWORD.toString()] || '';
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