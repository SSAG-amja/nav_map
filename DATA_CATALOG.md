# Data Catalog

모든 공간 데이터는 WGS84 / EPSG:4326 기준입니다.

| 파일 | 형태 | 개수 | 원본 | 설명 |
| --- | --- | ---: | --- | --- |
| `walk_nodes.geojson` | node | 212,066 | route/서울시 자치구별 도보 네트워크 공간정보.csv | 전체 도보 네트워크 NODE. 원본 NODE WKT를 WGS84 GeoJSON으로 변환. |
| `walk_network.geojson` | link | 279,016 | route/서울시 자치구별 도보 네트워크 공간정보.csv | 전체 도보 네트워크 LINK. |
| `braille_network_nodes.geojson` | node | 101,824 | sidewalk_representative_network_segments_v2.geojson에서 정규화 | 점자 네트워크의 endpoint를 정규화한 독립 노드. `braille_node_id`, 좌표, degree 포함. |
| `braille_network_links.geojson` | link | 52,577 | sidewalk_representative_network_segments_v2.geojson에서 정규화 | 점자 네트워크를 단독 사용 가능하도록 만든 링크. `braille_link_id`, `from_braille_node_id`, `to_braille_node_id`와 기존 속성 포함. |
| `crosswalk_links_enriched.geojson` | link | 11,562 | crosswalk_safety/서울시_대로변_횡단보도_위치정보.csv | 대로변 횡단보도 LINK. 자치구 횡단보도 점 속성을 최근접으로 참고 매칭. |
| `walk_crosswalk_nodes.geojson` | node | 19,428 | route/서울시 자치구별 도보 네트워크 공간정보.csv | 전체 도보 네트워크 NODE 중 횡단보도=1인 노드. |
| `walk_crosswalk_lonely_nodes.geojson` | node | 19 | walk_crosswalk_nodes.geojson + crosswalk_links_enriched.geojson | 대로변 횡단보도 LINK에서 10m 초과 떨어진 횡단보도 노드 검수 레이어. |
| `audible_signal_points.geojson` | node | 12,275 | crosswalk_safety/A073_P_음향신호기/A073_P.shp | 음향신호기 위치점. |
| `subway_elevators.geojson` | node | 552 | subway_access/서울시_지하철역_엘리베이터_위치정보.csv | 서울시 지하철역 엘리베이터 위치점. |
| `seoul_boundary.geojson` | polygon | 1 | 파생 산출물 | 서울 경계 표시용 레이어. |
| `roads.json` | lookup | - | 파생 산출물 | 도로명 검색 옵션. |
