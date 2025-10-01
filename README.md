# 🚀 OrderFlow-Frontend Git Flow 팀 가이드
## 🔑 핵심 규칙

main은 배포 전용 → 직접 수정 ❌

모든 개발은 feature/* 브랜치에서 시작

기능 작업 완료 후 → PR → develop 병합

병합 완료된 feature/* 브랜치는 삭제

## 1️⃣ 작업 시작 전 (매번 새로운 기능 시작할 때)
```bash
git checkout develop             # develop 이동
git pull origin develop          # 최신 develop 최신화
git checkout -b feature/BI       # 새 기능 브랜치 생성 (예: BI)
```

✅ 브랜치 네이밍 규칙

feature/PR → 발주요청

feature/PO → 발주

feature/GR → 입고

feature/STK → 재고

feature/SD → 판매

feature/BI → BI 분석

## 2️⃣ ‼ 여기서부터 로컬(내 PC)에서 개발 시작

👉 작업할 때는 반드시 이 순서대로!

```bash
git status                          # 변경 사항 확인
# (코드 수정 후)

git add .                           # 변경 파일 전부 스테이징
git status                          # 다시 확인해서 스테이징된 것 점검
git commit -m "Add BI page"         # 의미 있는 메시지 작성
git push origin feature/BI          # 원격에 올리기
```

## 3️⃣‼ GitHub에서 PR 생성 → 리뷰 요청 → develop 병합
## 4️⃣ 병합 후 (브랜치 정리)
```bash
git checkout develop                     # develop 이동
git pull origin develop                  # 최신 코드 가져오기
git branch -d feature/BI                 # 로컬 브랜치 삭제
git push origin --delete feature/BI      # 원격 브랜치 삭제
```

👉 다음 작업 때는 같은 이름이어도 develop에서 다시 새로 브랜치 생성

## 📌 브랜치 생명주기
```css
develop ────────────────┐
   │                     │
   │   feature/BI        │
   └─ merge → develop    │
                          \
                           main (배포)
```

## 🛠 초기 설정 (최초 1회만)
```bash
git clone https://github.com/JuniorNaver/OrderFlow-Frontend.git   # 레포 클론
cd OrderFlow-Frontend
git checkout -b develop          # main에서 develop 생성
git push -u origin develop       # 원격에 develop 반영
```
