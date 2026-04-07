import {
  object,
  string,
  optional,
  size,
  pattern,
  any,
  defaulted,
  coerce,
  integer,
  min,
} from 'superstruct';

//문자열을 숫자로 바꾸고 정수인지 확인하는 로직
const integerString = coerce(integer(), string(), (value) => parseInt(value));

//스토어 생성용
export const StoreStruct = object({
  name: size(string(), 2, 20),
  address: string(),
  detailAddress: string(),
  phoneNumber: pattern(size(string(), 10, 15), /^[0-9-]+$/),
  content: size(string(), 10, 500),
  image: optional(any()),
});

//페이지네이션 파라미터 타입
export const GetStoreProductListStruct = object({
  page: defaulted(min(integerString, 1), 1),
  pageSize: defaulted(min(integerString, 1), 10),
});
