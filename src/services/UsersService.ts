import {Service} from "@tsed/di";
import axios from "axios";
import {User} from "../models/User";
import {EnvsConsts} from "../consts/EnvsConsts";

@Service()
export class UsersService {

  private users: User[]|null = null;

  private couchUsersUrlPrefix: string;
  private couchUsersDbUser: string;
  private couchUsersDbPassword: string;

  constructor() {
    this.couchUsersUrlPrefix = process.env[EnvsConsts.COUCHDB_USERS_URL_PREFIX.toString()] || "";
    this.couchUsersDbUser = process.env[EnvsConsts.COUCHDB_USERS_DB_USER.toString()] || "";
    this.couchUsersDbPassword = process.env[EnvsConsts.COUCHDB_USERS_DB_PASSWORD.toString()] || "";
  }

  async getUsers(): Promise<User[]> {
    if (this.users && typeof this.users.length === 'number') {
      return this.users;
    }
    const url = `${this.couchUsersUrlPrefix}/_find`;
    const resp = await axios.post(
      url,
      {
        "selector": {},
        "limit": 9999
      },
      {auth: this.getAuth()}
    );
    if (resp?.data?.docs?.length > 0) {
      this.users = resp.data.docs as User[];
    } else {
      this.users = [];
    }
    this.enhanceUsers();
    return this.users;
  }

  private enhanceUsers(): void {
    if (!this.users || this.users.length <= 0) return;
    for (let i = 0; i < this.users.length; i++) {
      if (typeof this.users[i].name === 'string') continue;
      this.users[i].name = `${this.users[i].firstname} ${this.users[i].lastname}`;
    }
  }

  async findUserById(userId: number): Promise<User|null> {
    const users = await this.getUsers();
    return users.find(user => user.id == userId) || null;
  }

  async findUserByNames(firstname: string, lastname: string): Promise<User|null> {
    const users = await this.getUsers();
    return users.find(user => (user.firstname == firstname && user.lastname == lastname)) || null;
  }

  async findUserByFullname(fullname: string): Promise<User|null> {
    const names = fullname.split(' ');
    if (!names || typeof names[0] !== 'string' || typeof names[1] !== 'string') return null;
    const firstname = names[0];
    const lastname = names[1];
    return await this.findUserByNames(firstname, lastname);
  }

  private getAuth(): {username: string, password: string} {
    return {
      username: this.couchUsersDbUser,
      password: this.couchUsersDbPassword
    };
  }

}