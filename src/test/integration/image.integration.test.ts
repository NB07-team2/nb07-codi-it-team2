import { deleteFromS3, uploadImage } from '../../services/image.service';

describe.skip('S3 Image Integration Test (실제 AWS 연동)', () => {
  let uploadedUrl: string;

  // 테스트 실행 전 체크
  beforeAll(() => {
    if (
      !process.env.AWS_ACCESS_KEY ||
      process.env.AWS_ACCESS_KEY === 'test-access-key'
    ) {
      console.warn('⚠️ 실제 AWS 키가 없어 통합 테스트를 스킵합니다.');
    }
  });

  // 1. 업로드 테스트
  it('실제 S3 버킷에 파일을 업로드하고 올바른 URL을 반환해야 한다', async () => {
    // 가짜 이미지 버퍼(1x1 픽셀 투명 PNG 등)를 만듭니다.
    const tinyImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64',
    );

    const mockFile = {
      originalname: 'integration-test.png',
      mimetype: 'image/png',
      buffer: tinyImageBuffer,
    } as Express.Multer.File;

    // 실제 AWS S3로 전송
    const result = await uploadImage(mockFile);

    // 반환값 저장
    uploadedUrl = result.url;

    // 검증
    expect(result.url).toBeDefined();
    expect(result.key).toContain('others/');
    expect(result.url).toContain('s3.amazonaws.com'); // 또는 설정한 리전
  }, 10000); // 네트워크 타임아웃을 넉넉하게 10초로 설정

  // 2. 삭제 테스트
  it('업로드된 파일을 S3에서 정상적으로 삭제해야 한다', async () => {
    // 앞선 테스트에서 저장한 URL이 있는지 확인
    expect(uploadedUrl).toBeDefined();

    // 실제 S3에서 삭제 요청
    await expect(deleteFromS3(uploadedUrl)).resolves.not.toThrow();
  });
});
