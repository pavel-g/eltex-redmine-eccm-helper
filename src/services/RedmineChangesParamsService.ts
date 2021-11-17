import axios from "axios";
import {EnvsConsts} from "../consts/EnvsConsts";

export class RedmineChangesParamsService {

  private params: any[]|undefined;

  private urlPrefix: string;
  private username: string;
  private password: string;

  constructor() {
    this.urlPrefix = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_PARAMS_URL_PREFIX.toString()] || "";
    this.username = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_PARAMS_DB_USER.toString()] || "";
    this.password = process.env[EnvsConsts.COUCHDB_REDMINE_CHANGES_PARAMS_DB_PASSWORD.toString()] || "";
  }

  async getRedmineChangesParams(): Promise<any[]> {
    if (typeof this.params !== 'undefined') {
      return this.params;
    }
    const url = `${this.urlPrefix}/_find`;
    const request = {selector: {}, limit: 9999};
    const params = {auth:{username: this.username, password: this.password}};
    const resp = await axios.post(url, request, params);
    if (resp?.data?.docs?.length > 0) {
      this.params = resp.data.docs as any[];
    } else {
      this.params = [];
    }
    return this.params;
  }

  async findChangeParams(oldStatus: string, newStatus: string): Promise<any> {
    const params = await this.getRedmineChangesParams();
    let foundParam;
    foundParam = params.find(p => p.from == oldStatus && p.to == newStatus);
    if (!foundParam) {
      foundParam = params.find(p => !(p.from) && p.to == newStatus);
    }
    if (!foundParam) {
      foundParam = params.find(p => p.from == newStatus && !(p.to));
    }
    if (!foundParam) {
      foundParam = await this.getDefaultChangeParams();
    }
    return foundParam;
  }

  async getDefaultChangeParams(): Promise<any> {
    const params = await this.getRedmineChangesParams();
    return params.find(p => p.default)
  }

}