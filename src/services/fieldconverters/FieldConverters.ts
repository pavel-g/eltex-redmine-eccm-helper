import {Service} from "@tsed/di";
import {UserConverter} from "./UserConverter";
import {TagsConverter} from "./TagsConverter";
import {FieldConverterInterface} from "./FieldConverterInterface";
import {DefaultConverter} from "./DefaultConverter";
import {TimestampConverter} from "./TimestampConverter";
import {RedmineUrlConverter} from "./RedmineUrlConverter";

@Service()
export class FieldConverters {

  converters: Record<string, FieldConverterInterface>;

  constructor(
    private userConverter: UserConverter,
    private tagsConverter: TagsConverter,
    private timestampConverter: TimestampConverter,
    private redmineUrlConverter: RedmineUrlConverter,
    private defaultConverter: DefaultConverter
  ) {
    this.converters = {
      'user': this.userConverter,
      'tags': this.tagsConverter,
      'timestamp': this.timestampConverter,
      'redmine_url': this.redmineUrlConverter
    };
  }

  getConverter(name: string): FieldConverterInterface {
    return (this.converters.hasOwnProperty(name)) ? this.converters[name] : this.defaultConverter;
  }

}