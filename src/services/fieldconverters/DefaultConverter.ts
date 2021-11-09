import {Service} from "@tsed/di";
import {FieldConverterInterface} from "./FieldConverterInterface";

@Service()
export class DefaultConverter implements FieldConverterInterface {
  async convert(value: any): Promise<any> {
    return Promise.resolve(value);
  }
}