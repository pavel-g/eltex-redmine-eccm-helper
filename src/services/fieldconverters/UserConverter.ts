import {Service} from "@tsed/di";
import {FieldConverterInterface} from "./FieldConverterInterface";
import {UsersService} from "../UsersService";
import {User} from "../../models/User";

@Service()
export class UserConverter implements FieldConverterInterface {

  constructor(private usersService: UsersService) {
  }

  async convert(value: any): Promise<any> {
    let userId: number;
    if (typeof value === 'string' && isFinite(Number(value))) {
      userId = Number(value);
    } else if (typeof value === 'number') {
      userId = value;
    } else {
      return null;
    }
    const userFullData = await this.usersService.findUserById(userId);
    if (!userFullData) return null;
    return {
      id: userFullData.id,
      firstname: userFullData.firstname,
      lastname: userFullData.lastname,
      name: `${userFullData.firstname} ${userFullData.lastname}`
    } as User;
  }
}