import {Get, Returns} from "@tsed/schema";
import {Controller} from "@tsed/di";
import {User} from "../models/User";
import {UsersService} from "../services/UsersService";

@Controller("/users")
export class VersionController {

  constructor(private usersService: UsersService) {}

  @Get()
  @Returns(200, Array).Of(User)
  async get(): Promise<User[]> {
    return await this.usersService.getUsers();
  }

}