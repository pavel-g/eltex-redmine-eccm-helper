import {Service} from "@tsed/di";
import axios from "axios";
import {EnvsConsts} from "../consts/EnvsConsts";

@Service()
export class StatusesService {

  private statuses: any;

  private couchStatusesUrlPrefix: string;
  private couchStatusesDbUser: string;
  private couchStatusesDbPassword: string;

  constructor() {
    this.couchStatusesUrlPrefix = process.env[EnvsConsts.COUCHDB_STATUSES_URL_PREFIX.toString()] || '';
    this.couchStatusesDbUser = process.env[EnvsConsts.COUCHDB_STATUSES_DB_USER.toString()] || '';
    this.couchStatusesDbPassword = process.env[EnvsConsts.COUCHDB_STATUSES_DB_PASSWORD.toString()] || '';
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
    return this.statuses;
  }

  async findStatusById(statusId: number): Promise<any|null> {
    const statuses = await this.getStatuses();
    const status = statuses.find((status: any) => {
      return status.id == statusId;
    });
    if (!status) return null;
    return {
      id: status.id,
      name: status.name
    };
  }

}