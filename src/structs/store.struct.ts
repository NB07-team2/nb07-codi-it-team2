import {
  object,
  string,
  optional,
  size,
  pattern,
  Infer,
  any,
} from 'superstruct';

//스토어 생성용
export const StoreStruct = object({
  name: size(string(), 2, 20),
  address: string(),
  detailAddress: string(),
  phoneNumber: pattern(size(string(), 10, 15), /^[0-9-]+$/),
  content: size(string(), 10, 500),
  image: optional(any()),
});
export type CreateStoreRequest = Infer<typeof StoreStruct>;
