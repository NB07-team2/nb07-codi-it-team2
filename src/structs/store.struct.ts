import {
  object,
  string,
  optional,
  size,
  pattern,
  defaulted,
  coerce,
  integer,
  min,
  define,
} from 'superstruct';
import { MulterFileObject } from '../types/store.type';

//문자열을 숫자로 바꾸고 정수인지 확인하는 로직
const integerString = coerce(integer(), string(), (value) => parseInt(value));

//  Multer 파일 객체인지 검사하는 커스텀 구조체 정의
const MulterFile = define<MulterFileObject>('MulterFile', (value: unknown) => {
  // 데이터가 넘어왔을 때만 체크 (undefined는 optional이 알아서 처리함)
  if (!value || typeof value !== 'object') return false;

  const file = value as MulterFileObject;
  return (
    typeof file.originalname === 'string' &&
    typeof file.mimetype === 'string' &&
    (file.buffer instanceof Buffer || typeof file.path === 'string')
  );
});

//스토어 아이디 파라미터
export const StoreIdStruct = object({
  storeId: string(),
});

//스토어 생성, 수정 용
export const StoreStruct = object({
  name: size(string(), 2, 20),
  address: string(),
  detailAddress: string(),
  phoneNumber: pattern(size(string(), 10, 15), /^[0-9-]+$/),
  content: size(string(), 10, 500),
  image: optional(MulterFile),
});

//페이지네이션 파라미터
export const GetStoreProductListStruct = object({
  page: defaulted(min(integerString, 1), 1),
  pageSize: defaulted(min(integerString, 1), 10),
});
