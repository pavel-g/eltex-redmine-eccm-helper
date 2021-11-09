import {Service} from "@tsed/di";
import axios from "axios";

@Service()
export class StatusesService {

  private statuses: any;

  private couchStatusesUrlPrefix: string;
  private couchStatusesDbUser: string;
  private couchStatusesDbPassword: string;

  constructor() {
    this.couchStatusesUrlPrefix = process.env['COUCHDB_STATUSES_URL_PREFIX'] || '';
    this.couchStatusesDbUser = process.env['COUCHDB_STATUSES_DB_USER'] || '';
    this.couchStatusesDbPassword = process.env['COUCHDB_STATUSES_DB_PASSWORD'] || '';
  }

  async getStatuses(): Promise<any> {
    if (typeof this.statuses === 'undefined') {
      const url = `${this.couchStatusesUrlPrefix}/_find`;
      const request = {
        selector: {},
        limit: 9999
      };
      const params = {
        auth: {
          username: this.couchStatusesDbUser,
          password: this.couchStatusesDbPassword
        }
      }
      const resp = await axios.post(url, request, params);
      if (resp?.data?.docs?.length > 0) {
        this.statuses = resp.data.docs;
      } else {
        this.statuses = [];
      }
    }
  }

}