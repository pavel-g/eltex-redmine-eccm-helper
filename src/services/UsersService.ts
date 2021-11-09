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

  async getUsers(): Promise<User[]> {
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
    if (resp?.data?.docs?.length > 0) {
      this.users = resp.data.docs as User[];
    } else {
      this.users = [];
    }
    return this.users;
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