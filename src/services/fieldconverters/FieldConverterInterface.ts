export interface FieldConverterInterface {
  convert(value: any): Promise<any>;
}