import {FieldConverterInterface} from "./FieldConverterInterface";
import {Service} from "@tsed/di";

@Service()
export class TimestampConverter implements FieldConverterInterface {

  async convert(value: any): Promise<number|null> {
    let convertedValue: number;
    try {
      convertedValue = (new Date(value)).getTime();
    } catch (e) {
      return null;
    }
    return convertedValue;
  }

}