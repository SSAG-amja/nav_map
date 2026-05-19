const seoulBounds = L.latLngBounds(
  [37.4133, 126.7341],
  [37.7151, 127.2693],
);

const map = L.map("map", {
  maxBounds: seoulBounds,
  maxBoundsViscosity: 1.0,
  preferCanvas: true,
});
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
}).addTo(map);
map.fitBounds(seoulBounds);

let boxData;
let bboxNetworkSegmentData;
let representativeSegmentData;
let representativeSegment2Data;
let walkNetworkData;
let relevantWalkNetworkData;
let relevantWalkNetwork2Data;
let crosswalkData;
let walkCrosswalkNodeData;
let lonelyWalkCrosswalkNodeData;
let audibleSignalData;
let subwayElevatorData;
let boxLayer;
let bboxNetworkSegmentLayer;
let representativeSegmentLayer;
let representativeSegment2Layer;
let walkNetworkLayer;
let relevantWalkNetworkLayer;
let relevantWalkNetwork2Layer;
let crosswalkLayer;
let walkCrosswalkNodeLayer;
let lonelyWalkCrosswalkNodeLayer;
let audibleSignalLayer;
let subwayElevatorLayer;
let seoulBoundaryLayer;

const roadInput = document.querySelector("#roadInput");
const roadOptions = document.querySelector("#roadOptions");
const featureCount = document.querySelector("#featureCount");
const brailleCount = document.querySelector("#brailleCount");
const showBoxes = document.querySelector("#showBoxes");
const showRepresentativeSegments = document.querySelector("#showRepresentativeSegments");
const showRepresentativeSegments2 = document.querySelector("#showRepresentativeSegments2");
const showBboxNetworkSegments = document.querySelector("#showBboxNetworkSegments");
const showWalkNetwork = document.querySelector("#showWalkNetwork");
const showRelevantWalkNetwork = document.querySelector("#showRelevantWalkNetwork");
const showRelevantWalkNetwork2 = document.querySelector("#showRelevantWalkNetwork2");
const showCrosswalks = document.querySelector("#showCrosswalks");
const showWalkCrosswalkNodes = document.querySelector("#showWalkCrosswalkNodes");
const showLonelyWalkCrosswalkNodes = document.querySelector(
  "#showLonelyWalkCrosswalkNodes",
);
const showAudibleSignals = document.querySelector("#showAudibleSignals");
const showSubwayElevators = document.querySelector("#showSubwayElevators");

function roadName(feature) {
  return feature.properties["보도노선명"] || feature.properties.RN_NM || "미상";
}

function popupHtml(feature) {
  const p = feature.properties;
  return `
    <strong>${roadName(feature)}</strong><br>
    방향: ${p["보도노선방향"] || "-"}<br>
    구간: ${p.SCT_DES || "-"}<br>
    점자 연결: ${p.has_braille ? "예" : "아니오"}<br>
    블록: ${p.SWB_CODE_NAME || "-"}<br>
    색상: ${p.CLR_CODE_NAME || "-"}
  `;
}

function filteredFeatures(data, selectedRoad) {
  if (!selectedRoad || selectedRoad === "전체") return data.features;
  return data.features.filter((feature) => roadName(feature) === selectedRoad);
}

function isYes(value) {
  return value === "Y" || value === "유" || value === "있음" || value === "1";
}

function crosswalkStyle(feature) {
  const p = feature.properties;
  const hasLight = isYes(p["보행등유무"]);
  const hasAudio = isYes(p["음향신호기설치여부"]);
  const color = hasLight && hasAudio
    ? "#15803d"
    : hasAudio
      ? "#7c3aed"
      : hasLight
        ? "#2563eb"
        : "#64748b";

  return {
    color,
    weight: 2.5,
    opacity: 0.8,
    dashArray: isYes(p["보행자작동신호기유무"]) ? "6 4" : null,
  };
}

function crosswalkPopupHtml(feature) {
  const p = feature.properties;
  const distance = Number(p.matched_point_distance_m);
  return `
    <strong>횡단보도</strong><br>
    종류: ${p["횡단보도종류"] || "-"}<br>
    보행등: ${p["보행등유무"] || "-"}<br>
    음향: ${p["음향신호기설치여부"] || "-"}<br>
    보행자작동: ${p["보행자작동신호기유무"] || "-"}<br>
    고원식: ${p["고원식횡단보도유무"] || "-"}<br>
    매칭거리: ${Number.isFinite(distance) ? `${distance.toFixed(1)}m` : "-"}
  `;
}

function audibleSignalPopupHtml(feature) {
  const p = feature.properties;
  return `
    <strong>음향신호기</strong><br>
    관리번호: ${p.MGRNU || "-"}<br>
    신호기 종류: ${p.A073_KND_C || "-"}<br>
    상태: ${p.STAT_CDE || "-"}
  `;
}

function walkCrosswalkNodePopupHtml(feature) {
  const p = feature.properties;
  const distance = Number(p.nearest_crosswalk_link_m);
  return `
    <strong>횡단보도 노드</strong><br>
    노드 ID: ${p["노드 ID"] || "-"}<br>
    노드 유형: ${p["노드 유형 코드"] || "-"}<br>
    자치구: ${p["시군구명"] || "-"}<br>
    읍면동: ${p["읍면동명"] || "-"}<br>
    대로변 횡단보도 거리: ${Number.isFinite(distance) ? `${distance.toFixed(1)}m` : "-"}
  `;
}

function subwayElevatorPopupHtml(feature) {
  const p = feature.properties;
  return `
    <strong>지하철 엘리베이터</strong><br>
    역명: ${p["지하철역명"] || "-"}<br>
    역코드: ${p["지하철역코드"] || "-"}<br>
    노드 ID: ${p["노드 ID"] || "-"}<br>
    노드 유형: ${p["노드 유형 코드"] || "-"}<br>
    자치구: ${p["시군구명"] || "-"}<br>
    읍면동: ${p["읍면동명"] || "-"}
  `;
}

function renderRoad() {
  const selectedRoad = roadInput.value.trim();
  const boxes = filteredFeatures(boxData, selectedRoad);

  if (boxLayer) map.removeLayer(boxLayer);
  if (bboxNetworkSegmentLayer) map.removeLayer(bboxNetworkSegmentLayer);
  if (representativeSegmentLayer) map.removeLayer(representativeSegmentLayer);
  if (representativeSegment2Layer) map.removeLayer(representativeSegment2Layer);
  if (walkNetworkLayer) map.removeLayer(walkNetworkLayer);
  if (relevantWalkNetworkLayer) map.removeLayer(relevantWalkNetworkLayer);
  if (relevantWalkNetwork2Layer) map.removeLayer(relevantWalkNetwork2Layer);
  if (crosswalkLayer) map.removeLayer(crosswalkLayer);
  if (walkCrosswalkNodeLayer) map.removeLayer(walkCrosswalkNodeLayer);
  if (lonelyWalkCrosswalkNodeLayer) map.removeLayer(lonelyWalkCrosswalkNodeLayer);
  if (audibleSignalLayer) map.removeLayer(audibleSignalLayer);
  if (subwayElevatorLayer) map.removeLayer(subwayElevatorLayer);

  boxLayer = L.geoJSON(boxes, {
    style: (feature) => ({
      color: feature.properties.has_braille ? "#facc15" : "#9ca3af",
      fillColor: feature.properties.has_braille ? "#facc15" : "#9ca3af",
      fillOpacity: feature.properties.has_braille ? 0.5 : 0.28,
      weight: 1,
    }),
    onEachFeature: (feature, layer) => layer.bindPopup(popupHtml(feature)),
  });

  bboxNetworkSegmentLayer = L.geoJSON(
    filteredFeatures(bboxNetworkSegmentData, selectedRoad),
    {
      style: (feature) => ({
        color: feature.properties.has_braille ? "#eab308" : "#475569",
        weight: feature.properties.has_braille ? 3 : 2.5,
        opacity: 0.88,
      }),
      onEachFeature: (feature, layer) => layer.bindPopup(popupHtml(feature)),
    },
  );

  representativeSegmentLayer = L.geoJSON(
    filteredFeatures(representativeSegmentData, selectedRoad),
    {
      style: (feature) => ({
        color: feature.properties.has_braille ? "#dc2626" : "#1d4ed8",
        weight: feature.properties.has_braille ? 4 : 3,
        opacity: 0.9,
      }),
      pane: "representativePane",
      onEachFeature: (feature, layer) => layer.bindPopup(popupHtml(feature)),
    },
  );

  representativeSegment2Layer = L.geoJSON(
    filteredFeatures(representativeSegment2Data, selectedRoad),
    {
      style: (feature) => ({
        color: feature.properties.has_braille ? "#facc15" : "#111827",
        weight: feature.properties.has_braille ? 4 : 3,
        opacity: 0.92,
      }),
      pane: "representativePane",
      onEachFeature: (feature, layer) => layer.bindPopup(popupHtml(feature)),
    },
  );

  walkNetworkLayer = L.geoJSON(walkNetworkData, {
    style: {
      color: "#38bdf8",
      weight: 1.1,
      opacity: 0.55,
    },
    pane: "walkNetworkPane",
  });

  relevantWalkNetworkLayer = L.geoJSON(relevantWalkNetworkData, {
    style: {
      color: "#0891b2",
      weight: 1.25,
      opacity: 0.42,
    },
    pane: "relevantWalkNetworkPane",
  });

  relevantWalkNetwork2Layer = L.geoJSON(relevantWalkNetwork2Data, {
    style: {
      color: "#0f766e",
      weight: 1.25,
      opacity: 0.44,
    },
    pane: "relevantWalkNetworkPane",
  });

  crosswalkLayer = L.geoJSON(crosswalkData, {
    style: crosswalkStyle,
    pane: "crosswalkPane",
    onEachFeature: (feature, layer) => layer.bindPopup(crosswalkPopupHtml(feature)),
  });

  walkCrosswalkNodeLayer = L.geoJSON(walkCrosswalkNodeData, {
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 3,
        color: "#166534",
        weight: 1,
        fillColor: "#22c55e",
        fillOpacity: 0.86,
        pane: "crosswalkNodePane",
      }),
    pane: "crosswalkNodePane",
    onEachFeature: (feature, layer) =>
      layer.bindPopup(walkCrosswalkNodePopupHtml(feature)),
  });

  lonelyWalkCrosswalkNodeLayer = L.geoJSON(lonelyWalkCrosswalkNodeData, {
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 5,
        color: "#991b1b",
        weight: 1.5,
        fillColor: "#ef4444",
        fillOpacity: 0.95,
        pane: "lonelyCrosswalkNodePane",
      }),
    pane: "lonelyCrosswalkNodePane",
    onEachFeature: (feature, layer) =>
      layer.bindPopup(walkCrosswalkNodePopupHtml(feature)),
  });

  audibleSignalLayer = L.geoJSON(audibleSignalData, {
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 4,
        color: "#581c87",
        weight: 1.5,
        fillColor: "#a855f7",
        fillOpacity: 0.78,
        pane: "signalPane",
      }),
    pane: "signalPane",
    onEachFeature: (feature, layer) =>
      layer.bindPopup(audibleSignalPopupHtml(feature)),
  });

  subwayElevatorLayer = L.geoJSON(subwayElevatorData, {
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 5,
        color: "#1e3a8a",
        weight: 1.5,
        fillColor: "#1d4ed8",
        fillOpacity: 0.9,
        pane: "subwayElevatorPane",
      }),
    pane: "subwayElevatorPane",
    onEachFeature: (feature, layer) =>
      layer.bindPopup(subwayElevatorPopupHtml(feature)),
  });

  if (showBoxes.checked) boxLayer.addTo(map);
  if (showRepresentativeSegments.checked) representativeSegmentLayer.addTo(map);
  if (showRepresentativeSegments2.checked) representativeSegment2Layer.addTo(map);
  if (showBboxNetworkSegments.checked) bboxNetworkSegmentLayer.addTo(map);
  if (showRelevantWalkNetwork.checked) relevantWalkNetworkLayer.addTo(map);
  if (showRelevantWalkNetwork2.checked) relevantWalkNetwork2Layer.addTo(map);
  if (showWalkNetwork.checked) walkNetworkLayer.addTo(map);
  if (showCrosswalks.checked) crosswalkLayer.addTo(map);
  if (showWalkCrosswalkNodes.checked) walkCrosswalkNodeLayer.addTo(map);
  if (showLonelyWalkCrosswalkNodes.checked) lonelyWalkCrosswalkNodeLayer.addTo(map);
  if (showAudibleSignals.checked) audibleSignalLayer.addTo(map);
  if (showSubwayElevators.checked) subwayElevatorLayer.addTo(map);

  featureCount.textContent = boxes.length.toLocaleString();
  brailleCount.textContent = boxes
    .filter((feature) => feature.properties.has_braille)
    .length.toLocaleString();

  if (boxes.length > 0) {
    const bounds = showBoxes.checked
      ? boxLayer.getBounds()
      : representativeSegmentLayer.getBounds();
    map.fitBounds(selectedRoad ? bounds : seoulBounds, { padding: [24, 24] });
  }
}

async function init() {
  map.createPane("walkNetworkPane");
  map.getPane("walkNetworkPane").style.zIndex = 350;
  map.createPane("relevantWalkNetworkPane");
  map.getPane("relevantWalkNetworkPane").style.zIndex = 360;
  map.createPane("crosswalkPane");
  map.getPane("crosswalkPane").style.zIndex = 410;
  map.createPane("crosswalkNodePane");
  map.getPane("crosswalkNodePane").style.zIndex = 435;
  map.createPane("lonelyCrosswalkNodePane");
  map.getPane("lonelyCrosswalkNodePane").style.zIndex = 445;
  map.createPane("representativePane");
  map.getPane("representativePane").style.zIndex = 430;
  map.createPane("signalPane");
  map.getPane("signalPane").style.zIndex = 440;
  map.createPane("subwayElevatorPane");
  map.getPane("subwayElevatorPane").style.zIndex = 450;
  map.createPane("overlayPane");
  map.getPane("overlayPane").style.zIndex = 400;

  const [
    roads,
    boxes,
    representativeSegments,
    representativeSegments2,
    bboxNetworkSegments,
    walkNetwork,
    relevantWalkNetwork,
    relevantWalkNetwork2,
    crosswalks,
    walkCrosswalkNodes,
    lonelyWalkCrosswalkNodes,
    audibleSignals,
    subwayElevators,
    seoulBoundary,
  ] =
    await Promise.all([
    fetch("./data/roads.json").then((res) => res.json()),
    fetch("./data/sidewalk_boxes.geojson").then((res) => res.json()),
    fetch("./data/sidewalk_representative_network_segments.geojson").then((res) =>
      res.json(),
    ),
    fetch("./data/sidewalk_representative_network_segments_v2.geojson").then((res) =>
      res.json(),
    ),
    fetch("./data/sidewalk_bbox_network_segments.geojson").then((res) =>
      res.json(),
    ),
    fetch("./data/walk_network.geojson").then((res) => res.json()),
    fetch("./data/walk_network_clean_candidates.geojson").then((res) => res.json()),
    fetch("./data/walk_network_clean_candidates_v2.geojson").then((res) =>
      res.json(),
    ),
    fetch("./data/crosswalk_links_enriched.geojson").then((res) => res.json()),
    fetch("./data/walk_crosswalk_nodes.geojson").then((res) => res.json()),
    fetch("./data/walk_crosswalk_lonely_nodes.geojson").then((res) => res.json()),
    fetch("./data/audible_signal_points.geojson").then((res) => res.json()),
    fetch("./data/subway_elevators.geojson").then((res) => res.json()),
    fetch("./data/seoul_boundary.geojson").then((res) => res.json()),
  ]);

  roads.forEach((road) => {
    const option = document.createElement("option");
    option.value = road;
    roadOptions.append(option);
  });

  boxData = boxes;
  representativeSegmentData = representativeSegments;
  representativeSegment2Data = representativeSegments2;
  bboxNetworkSegmentData = bboxNetworkSegments;
  walkNetworkData = walkNetwork;
  relevantWalkNetworkData = relevantWalkNetwork;
  relevantWalkNetwork2Data = relevantWalkNetwork2;
  crosswalkData = crosswalks;
  walkCrosswalkNodeData = walkCrosswalkNodes;
  lonelyWalkCrosswalkNodeData = lonelyWalkCrosswalkNodes;
  audibleSignalData = audibleSignals;
  subwayElevatorData = subwayElevators;
  seoulBoundaryLayer = L.geoJSON(seoulBoundary, {
    style: {
      color: "#2563eb",
      weight: 2,
      fillColor: "#93c5fd",
      fillOpacity: 0.05,
    },
    interactive: false,
  }).addTo(map);
  roadInput.value = "전체";
  renderRoad();
}

document.querySelector("#applyRoad").addEventListener("click", renderRoad);
roadInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") renderRoad();
});
showBoxes.addEventListener("change", renderRoad);
showRepresentativeSegments.addEventListener("change", renderRoad);
showRepresentativeSegments2.addEventListener("change", renderRoad);
showBboxNetworkSegments.addEventListener("change", renderRoad);
showWalkNetwork.addEventListener("change", renderRoad);
showRelevantWalkNetwork.addEventListener("change", renderRoad);
showRelevantWalkNetwork2.addEventListener("change", renderRoad);
showCrosswalks.addEventListener("change", renderRoad);
showWalkCrosswalkNodes.addEventListener("change", renderRoad);
showLonelyWalkCrosswalkNodes.addEventListener("change", renderRoad);
showAudibleSignals.addEventListener("change", renderRoad);
showSubwayElevators.addEventListener("change", renderRoad);

init();
