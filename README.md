
###  📅 Phase 1: 뼈대 구축 및 정적 렌더링 (Hello World)
####  목표
- 브라우저 확장을 설치하고, 모든 웹페이지 구석에 '움직이지 않는' 고양이 이미지를 띄우는 것까지 성공하기.
#### 핵심 작업
- Plasmo 프레임워크 초기화 (React + TypeScript).
- manifest.json 권한 설정 (activeTab, storage, scripting).
- Content Script를 통해 웹페이지 DOM에 <div  id="pixel-pet-root"> 주입하기.
- Shadow DOM 설정 (웹페이지의 기존 CSS와 충돌 방지).
#### 결과물
- 어느 사이트를 가도 화면 오른쪽 아래에 고양이 그림이 떠 있어야 함.

### 🏃 Phase 2: 애니메이션 엔진 구현 (The Engine)
#### 목표
- 고양이가 화면을 자연스럽게 돌아다니고, 스프라이트(동작)가 바뀌도록 만들기. (가장 중요한 단계)
#### 핵심 작업
- requestAnimationFrame을 사용한 메인 루프 구현.
- SpriteAnimator 클래스 개발: 아틀라스 이미지를 로드하고 프레임 단위로 자르는 로직.
- Physics 모듈 개발: React State가 아닌 ref를 사용하여 좌표(x, y) 업데이트 (성능 최적화).
- 기본 상태 머신(FSM) 구현: Idle ↔ Walk 상태 전환.
#### 결과물
- 고양이가 화면 바닥을 걸어 다니고, 벽에 닿으면 뒤돌아서 다시 걸어감.

### 🧠 Phase 3: AI 두뇌 및 대화 시스템 (The Brain)
#### 목표
- 사용자의 API Key를 저장하고, LLM과 통신하여 말풍선을 띄우기.
#### 핵심 작업
- Storage 구현: chrome.storage.sync를 이용한 API Key 저장/로드 (Popup UI 포함).
- Background Service Worker: Content Script에서 직접 API를 호출하면 CORS 에러가 나므로, 백그라운드 스크립트에서 OpenAI API 호출을 중계(Proxy)하는 로직 구현.
- Chat UI: 고양이 머리 위에 뜨는 말풍선 컴포넌트 (Thinking... → 텍스트 출력 → 사라짐).
#### 결과물
- 팝업에 키를 넣고 "안녕" 하면 고양이가 말풍선으로 대답함.

### 😈 Phase 4: 상황 인식 및 방해 공작 (Interaction)
#### 목표
- 사용자의 마우스, 비디오, 입력창을 인식하고 반응하기.
#### 핵심 작업
- Observer 패턴: DOM 변화 감지 (비디오 태그 찾기, 입력창 포커스 감지).
- Mouse Event Listener: 마우스 좌표 추적 및 Hover 감지.
- Interaction Logic:
	- 비디오 발견 시 → 좌표 이동 후 Sit 모드.
	- 마우스 접근 시 → Run 모드로 도망가거나 Push 모드로 밀어내기.
#### 결과물
- 유튜브를 켜면 고양이가 영상 옆에 앉고, 마우스를 갖다 대면 도망감.

### ⚙️ Phase 5: 설정 고도화 및 배포 준비 (Polish)
#### 목표
- 사용자 편의 기능 추가 및 코드 최적화.
#### 핵심 작업
- Popup UI 개선: 캐릭터 선택(치즈냥/턱시도냥), 방해 모드 ON/OFF, 소리 ON/OFF.
- Persona JSON 연동: Phase 3의 하드코딩된 프롬프트를 설정 파일로 분리.
- Sleep Mode: 일정 시간(5분) 입력 없으면 애니메이션 정지 (CPU 절약).
#### 결과물
- 완성된 확장 프로그램. 친구에게 .crx나 압축파일로 줘도 잘 동작함.