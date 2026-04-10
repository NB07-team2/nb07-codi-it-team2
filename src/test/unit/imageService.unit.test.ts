import { deleteFromS3, uploadImage } from '../../services/image.service';
import s3Client from '../../utils/s3Client.util';

// AWS S3 클라이언트 모킹 (실제 S3 업로드 방지)
jest.mock('../../utils/s3Client.util', () => ({
  send: jest.fn(),
}));

// UUID 모킹 (파일명 예측을 위해)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('이미지 서비스 유닛 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 매 테스트마다 모킹 초기화
  });

  describe('uploadImage', () => {
    it('파일이 정상적으로 주어지면 S3 업로드 후 URL과 KEY를 반환해야 한다', async () => {
      // 1. 가짜 Multer 파일 객체 생성
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        buffer: Buffer.from('fake image content'),
      } as Express.Multer.File;

      // 2. S3 send 메서드가 성공(resolves)한다고 가정
      (s3Client.send as jest.Mock).mockResolvedValue(true);

      // 3. 서비스 실행
      const result = await uploadImage(mockFile);

      // 4. 검증
      expect(s3Client.send).toHaveBeenCalledTimes(1);
      expect(result.key).toBe('others/test-uuid-1234.png');
      expect(result.url).toContain(
        's3.amazonaws.com/others/test-uuid-1234.png',
      );
    });

    it('파일이 없으면 BadRequestError를 던져야 한다', async () => {
      await expect(uploadImage(undefined)).rejects.toThrow(
        '잘못된 요청입니다.',
      );
      await expect(uploadImage(undefined)).rejects.toThrow(
        '잘못된 요청입니다.',
      );
    });
  });

  describe('deleteFromS3', () => {
    it('유효한 URL이 주어지면 S3 삭제 명령을 실행해야 한다', async () => {
      const dummyUrl =
        'https://my-test-bucket.s3.amazonaws.com/others/test.png';

      (s3Client.send as jest.Mock).mockResolvedValue(true);

      await deleteFromS3(dummyUrl);

      expect(s3Client.send).toHaveBeenCalledTimes(1);
    });
  });
});
