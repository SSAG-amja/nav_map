# Seoul Accessible Navigation Map Package

서울시 시각장애인 보행 네비게이션용 지도 데이터 배포본입니다.

## 구성

- `web/`: 정적 Leaflet 지도 뷰어
- `data_gz/`: 지도에서 사용하는 GeoJSON/JSON 압축 파일
- `unpack_data.py`: 압축 데이터를 `web/data/`로 푸는 스크립트
- `DATA_CATALOG.md`: 데이터별 원본, 형태, 설명
- `metadata.json`: 생성 시각, 좌표계, 파일 크기, feature 수

## 실행

### macOS / Linux

```bash
python3 unpack_data.py
python3 -m http.server 8000 -d web
```

브라우저에서 열기:

```text
http://localhost:8000
```

### Windows

PowerShell 또는 명령 프롬프트에서 `release_navigation_map` 폴더로 이동한 뒤 실행합니다.

```powershell
py unpack_data.py
py -m http.server 8000 -d web
```

브라우저에서 열기:

```text
http://localhost:8000
```

`py` 명령이 없으면 Python을 설치하고, 설치 옵션에서 `Add python.exe to PATH`를 체크한 뒤 아래처럼 실행합니다.

```powershell
python unpack_data.py
python -m http.server 8000 -d web
```

## Python 패키지

지도 실행과 압축 해제만 할 때는 별도 패키지 설치가 필요 없습니다. `unpack_data.py`는 Python 표준 라이브러리만 사용합니다.

데이터를 다시 만들거나 GeoJSON을 분석하려면 아래처럼 설치합니다.

```bash
python -m pip install -r requirements.txt
```

## 좌표계

웹에 포함된 모든 GeoJSON은 WGS84, EPSG:4326 기준입니다.
거리 기반 검수는 내부 계산에서만 EPSG:5181을 사용했고, 결과 저장은 EPSG:4326으로 되돌렸습니다.

## GitHub 업로드 메모

압축 파일은 `data_gz/`에 보관합니다. 실행 전 `unpack_data.py`로 `web/data/`를 생성하세요.
`web/data/`는 생성 산출물이므로 Git 추적 대상에서 제외해도 됩니다.
