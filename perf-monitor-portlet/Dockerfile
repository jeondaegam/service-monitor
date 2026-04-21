# 1. 노드 이미지 선택 (가벼운 alpine 버전)
FROM node:22-alpine

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 의존성 파일만 먼저 복사 (캐싱 활용, 빌드 속도 최적화)
COPY package.json package-lock.json ./

# 4. 라이브러리 설치
RUN npm install

# 5. 소스 코드 전체 복사
COPY . .

# 6. Vite 기본 포트 개방
EXPOSE 5173

# 7. 실행 (개발 서버 모드)
CMD ["npm", "run", "dev"]