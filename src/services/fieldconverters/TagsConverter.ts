import {Service} from "@tsed/di";
import {FieldConverterInterface} from "./FieldConverterInterface";

@Service()
export class TagsConverter implements FieldConverterInterface {
  async convert(value: any): Promise<any> {
    if (typeof value === 'string') {
      return value.split(/[ \t,;]/);
    } else {
      return [];
    }
  }
}