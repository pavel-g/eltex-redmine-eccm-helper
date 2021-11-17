import {Get, Returns} from "@tsed/schema";
import {Controller} from "@tsed/di";
import {Version} from "../models/Version";

@Controller("/version")
export class VersionController {
  @Get()
  @Returns(200, Version)
  get(): Version {
    return {version: "0.1", name: "eltex-redmine-eccm-helper", env: process.env};
  }
}