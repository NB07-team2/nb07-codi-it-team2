import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from './constants.util';

// 전역 변수로 선언하여 개발 환경에서의 중복 생성을 방지
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // DB 환경 변수 강제 지정
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    //로그 설정: 대시보드 쿼리 최적화를 위해 쿼리 실행 시간을 모니터링
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

// 쿼리 실행 시간 로깅 미들웨어 (통계 최적화용)
if (NODE_ENV === 'development') {
  // Prisma 내부 이벤트를 구독하여 실행 시간을 출력
  (prisma as any).$on(
    'query',
    (e: { query: string; params: string; duration: number }) => {
      console.log(`⏱️  Duration: ${e.duration}ms`);
      console.log(`🔍 Query: ${e.query}`);
      console.log('--------------------------------------');
    },
  );
}

if (NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
