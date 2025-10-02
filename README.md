# 🚀 OrderFlow-Frontend Git Flow 팀 가이드
## 🔑 핵심 규칙
main은 배포 전용 → 직접 수정 ❌

모든 개발은 feature/* 브랜치에서 시작

기능 작업 완료 후 → PR → develop 병합

병합 완료된 feature/* 브랜치는 삭제

## 1️⃣ 작업 시작 전 (매 작업 시작 때마다 / 새 기능 브랜치 생성)
```bash
git checkout develop           # develop 이동
git pull origin develop        # 최신 코드 가져오기
git checkout -b feature/BI     # 새 기능 브랜치 생성 (예: BI)
```
✅ 브랜치 네이밍 규칙

feature/PR → 발주요청

feature/PO → 발주

feature/GR → 입고

feature/STK → 재고

feature/SD → 판매

feature/BI → BI 분석

## 2️⃣‼ 여기서부터 로컬(개인 컴퓨터)에서 작업 시작

## 3️⃣ 작업 후 (커밋 & 푸시)
```bash
git status                      # 변경 사항 확인
git add .                       # 변경 파일 스테이징
git status                      # 변경 사항 확인
git commit -m "Add BI page"     # 커밋
git push origin feature/BI      # 원격 저장소에 푸시
```

## 4️⃣‼ GitHub에서 PR 생성 → 리뷰 요청 → develop 병합

## 5️⃣ PR -> 병합 끝난 후 (‼ 병합 전에 하지 마세요 / 브랜치 정리)
```bash
git checkout develop                     # develop 이동
git pull origin develop                  # 최신 코드 가져오기
git branch -d feature/BI                 # 로컬 feature 브랜치 삭제
git push origin --delete feature/BI      # 원격 feature 브랜치 삭제
```
👉 다음 작업 때는 같은 이름이어도 develop에서 다시 새로 브랜치 생성

## 📌 브랜치 생명주기
```css
develop ──────────────┐
   │                  │
   │   feature/BI     │
   └─ merge → develop │
                       \
                        main (배포)
```
기능 개발 중 → feature 브랜치 유지

기능 완료 → develop 병합 → 브랜치 삭제

새 기능/개선 → develop에서 새 feature 브랜치 생성

## 🛠 초기 설정 (최초 1회만)
### 0. 레포 클론
```bash
git clone https://github.com/JuniorNaver/OrderFlow-Frontend.git   # 레포 클론
cd OrderFlow-Frontend
git checkout develop          # develop 브랜치로 이동
```

## ⚙️ 실행 환경 세팅 (이것도 최초 1회만)

### 1. 터미널 열기
Windows: VS Code에서 Ctrl + ~ (틸드) → 내장 터미널 열기

Mac: Command + J → 내장 터미널 열기

또는 프로젝트 폴더(OrderFlow-Frontend) 안에서 마우스 우클릭 → 터미널 열기

### 2. 라이브러리 설치
```bash
npm install                              # package.json에 정의된 모든 기본 라이브러리 설치 (React, Vite 등)

npm install react-router-dom             # 라우팅(페이지 이동) 라이브러리
npm install @reduxjs/toolkit react-redux # 전역 상태 관리 (Redux 공식 툴킷 + React 연결)
npm install @tanstack/react-query        # 서버 상태 관리 (API 통신 + 캐싱 + 자동 리페치)
npm install axios                        # fetch 대신 더 편리한 HTTP 통신 라이브러리
```
npm install → package.json에 정의된 기본 라이브러리를 모두 설치합니다.

그 외 라이브러리들은 프로젝트 기능 구현에 필요한 추가 설치입니다.

처음 클론한 팀원이라면 반드시 위 과정을 1회 실행해야 합니다.

설치가 끝나면 node_modules/ 폴더가 생성되며, 정상 설치된 것입니다.

### 🚀 개발 서버 실행
```bash
npm run dev
```

개발 서버 실행 후 터미널에 주소가 출력됩니다.
예:
```bash
VITE v5.2.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
이 주소를 브라우저 주소창에 입력하면 앱이 실행됩니다.

코드 저장 시 자동 반영(Hot Reload) → 새로고침 필요 없음.
