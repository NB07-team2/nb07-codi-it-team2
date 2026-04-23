# 🛒 CODI-IT : 패션 이커머스 플랫폼

**사용자와 스토어를 잇는 고도화된 패션 이커머스 플랫폼**

CODI-IT은 트렌디한 패션 아이템의 탐색부터 구매, 판매 관리 및 데이터 분석까지 아우르는 통합 이커머스 솔루션을 제공합니다.

---

## 🔗 프로젝트 링크

- **팀 협업 문서 (Notion):**[ 수정 필요함 ] - 노션 링크
- **디자인 시안 (Figma):** [바로가기](https://www.figma.com/design/SHHlFNOr1FypN3qrgaLOyT/-%EA%B3%B5%EC%9C%A0%EC%9A%A9--CODI-IT-%ED%8C%A8%EC%85%98-%EC%9D%B4%EC%BB%A4%EB%A8%B8%EC%8A%A4-%ED%94%8C%EB%9E%AB%ED%8F%BC?node-id=0-1&t=n77WZzwLNU1OJRpk-1)
- **프론트엔드 URL** : [바로가기] (https://codiit.site)

---

## 👥 팀원 구성 및 역할 (R&R)

| **이름** | **담당 역할** | **주요 구현 기능** |
| --- | --- | --- |
| **이보라 (Leader)** | **AWS & Git & 이미지 S3 업로드, 등급 값 조회, 스토어 및 리뷰 API** | 스토어 CRUD,사용자 별점 및 리뷰 CRUD AWS S3 이미지 업로드 유틸리티 |
| **김관규** | **장바구니, 대시보드, 알림 API** | 장바구니 퍼시스턴스, 판매 통계 대시보드, 실시간 알림 |
| **구창민** | **구매( 주문 ), 문의, API** | 가상 결제 프로세스, 포인트/등급 산정 엔진, 상품 문의 시스템 |
| **김승철** | **인증, 유저, 상품 API** | JWT 기반 로그인 / 회원가입, User CRUD 관리,카테고리별 상품 필터링/정렬 시스템 CRUD, S3 이미지 라이프 사이클 관리 |
| **하동우(중도하차)** | **상품 등록 ** |  |

## 🛠 기술 스택

### **Backend & Infrastructure**

- **Core:** Node.js (Express), TypeScript
- **Database:** PostgreSQL, AWS RDS, Prisma (ORM)
- **Storage:** AWS S3 (Image Hosting)
- **Deployment:** AWS EC2, Nginx, PM2, GitHub Actions (CI/CD)
- **Testing:** Jest, Supertest

---

## 📌 주요 기능 

### 1. 쇼핑 및 상품 탐색 (Buyer Experience)

- **다차원 필터링:** 카테고리(Top, Outer 등), 가격대, 사이즈, 관심 스토어별 맞춤 상품 조회.
- **스마트 검색:** 상품명 및 스토어명 기반 검색과 별점/판매순/최신순 정렬 지원.
- **장바구니 유지:** 로그아웃 후 재로그인 시에도 장바구니 데이터가 보존되는 영속성 구현.

### 2. 주문 및 혜택 시스템 (Order & Grade)

- **가상 결제:** 포인트 사용 및 배송 정보 입력을 포함한 결제 시뮬레이션.
- **등급별 혜택:** 누적 구매 금액에 따른 유동적 등급 산정 및 차등 포인트 적립률 적용.
- **재고 연동:** 결제 시 실시간 재고 차감 및 품절 시 구매 차단 로직.

### 3. 판매 및 스토어 관리 (Seller Experience)

- **스토어 운영:** 판매자당 1개의 고유 스토어 개설 및 상품/할인 기간 관리.
- **데이터 인사이트:** 기간별 매출액, 판매 건수, 인기 상품 TOP 5를 시각화한 대시보드 제공.
- **고객 소통:** 상품 문의 답변 시스템 및 비밀글 기능을 통한 프라이버시 보호.

### 4. 실시간 알림 서비스 (Notification)

- **품절 알림:** 담아둔 상품이나 판매 중인 상품 품절 시 실시간 Push 알림.
- **문의 응대:** 문의글 답변 등록 시 구매자에게 즉각적인 알림 전송.

### 5. 인증 및 권한 관리 (Auth)

- **RBAC (Role-Based Access Control):** 판매자(SELLER)와 구매자(BUYER)의 권한을 엄격히 분리하여 기능 접근을 제어합니다.
- **보안:** 현재 로그인 된 유저의 Access Token을 통한 2차 검증 로직 적용.

---

## 📂 프로젝트 폴더 구조

```jsx
root/
├── frontend/             # React/Next.js 프론트엔드 소스 코드
└── backend/              # Node.js Express 백엔드 소스 코드 (현재 디렉토리)
├── prisma/               # Database ORM 설정
│   ├── migrations/       # DB 스키마 변경 이력
│   ├── schema.prisma     # 데이터 모델 정의
│   └── seed.ts           # 초기 데이터 주입 스크립트
├── src/                  # 메인 소스 코드
│   ├── controllers/      # API 요청 처리 및 응답 반환
│   ├── services/         # 핵심 비즈니스 로직 (Auth, S3 이미지 설정 등)
│   ├── repositories/     # DB 접근 계층
│   ├── routes/           # API 엔드포인트 경로 정의
│   ├── middlewares/      # 권한 검증( Token )
│   ├── types/            # 전역 interface 정의
│   ├── utils/            # S3 클라이언트, 암호화 등 유틸리티
│   ├── errors/           # Custom Error 클래스, Error 핸들러
│   ├── models/           # 인증 요청 / 응답 DTO 및 데이터 모델 정의
│   ├── structs/          # 구조적 타입 정의
│   └── tests/            # Jest & Supertest 테스트 코드
├── .devcontainer/        # 개발 컨테이너 설정
├── .github/              # GitHub Actions 및 PR 템플릿
├── .vscode/              # VS Code 프로젝트 설정
├── dist/                 # 빌드 결과물 (컴파일된 JS)
├── node_modules/         # 외부 라이브러리 의존성
├── .env                  # 환경 변수 설정 파일
├── .gitignore            # Git 관리 예외 설정
├── .prettierrc           # 코드 포맷팅 설정
├── jest.config.js        # 테스트 프레임워크 설정
├── package.json          # 프로젝트 정보 및 의존성 관리
├── tsconfig.json         # TypeScript 컴파일 설정
└── [README.md](http://readme.md/)             # 프로젝트 메인 문서
```

---

## 🚀 시작 가이드

### 1. 환경 변수 설정 (.env)

```
DATABASE_URL="postgresql://user:password@localhost:5432/codiit"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET="your_refresh_key"
JWT_REFRESH_EXPIRES_IN=7d
AWS_ACCESS_KEY="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET_NAME="your_bucket_name"
```

### 2. 설치 및 실행

```bash
npm install
npx prisma generate
npm run dev
```

---

## 🤝 협업 규칙

- **Git Flow:** `main` <- `develop` <- `feat/name`
- **PR Rule:** PR 템플릿 작성 필수
    - 최소 2명의 **Approve** 획득 시 Merge 가능
- **Code Style:** ESLint 및 Prettier 설정 공유를 통한 코드 컨벤션 통일

---

## 🗓 프로젝트 일정

- **기능 구현:** 2026.03.27 ~ 2026.04.30
- **중간 발표:** 2026.04.16
- **프론트엔드 연동:** 2026.04.30 ~ 2026.05.05
- **배포 및 안정화:** 2026.05.06 ~ 2026.05.10
- **최종 발표:** 2026.05.11
