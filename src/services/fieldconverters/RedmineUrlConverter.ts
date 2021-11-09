import {FieldConverterInterface} from "./FieldConverterInterface";
import {Service} from "@tsed/di";

@Service()
export class RedmineUrlConverter implements FieldConverterInterface {

  private redminePublicUrl: string;

  constructor() {
    this.redminePublicUrl = process.env['REDMINE_PUBLIC_URL'] || "";
  }

  async convert(issueId: any): Promise<any> {
    return Promise.resolve(`${this.redminePublicUrl}/issues/${issueId}`);
  }

}