import {Service} from "@tsed/di";
import axios from "axios";
import {User} from "../models/User";

@Service()
export class UsersService {

  private users: User[]|null = null;

  private couchUsersUrlPrefix: string;
  private couchUsersDbUser: string;
  private couchUsersDbPassword: string;

  constructor() {
    this.couchUsersUrlPrefix = process.env['COUCHDB_USERS_URL_PREFIX'] || "";
    this.couchUsersDbUser = process.env['COUCHDB_USERS_DB_USER'] || "";
    this.couchUsersDbPassword = process.env['COUCHDB_USERS_DB_PASSWORD'] || "";
  }

  async loadUsers(): Promise<any> {
    if (this.users && typeof this.users.length === 'number') {
      return this.users;
    }
    const url = `${this.couchUsersUrlPrefix}/_find`;
    const resp = await axios.post(
      url,
      {
        "selector": {},
        "limit": 1000
      },
      {auth: this.getAuth()}
    );
    if (resp.data && resp?.data?.docs) {
      this.users = resp.data.docs
    } else {
      this.users = [];
    }
    return this.users;
  }

  private getAuth(): {username: string, password: string} {
    return {
      username: this.couchUsersDbUser,
      password: this.couchUsersDbPassword
    };
  }

}