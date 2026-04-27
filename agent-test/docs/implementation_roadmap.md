# OpenSim — 67개 실험 커버를 위한 구현 로드맵

`science_list_analysis.md` 결과를 실행 가능한 Phase 단위 작업으로 풀어쓴 문서.
각 Phase는 (Goal / Deliverables / Verification / Effort / Dependencies / Risks) 6필드로 정의.

---

## 전체 흐름 한 장 요약

```
[현재] Phase 11 완료 — interactive_protocol archetype + 적정/마찰 데모
          ↓
Phase 12   A등급 회귀 검증 (가능 11/67)
          ↓
Phase 13   B등급 lab_object 일괄 추가 (4개 sub-phase, 가능 49/67)
  ├─ 13.A 물리 운동학 자산
  ├─ 13.B 화학·생물 공유 자산 (열·기포·연소)
  ├─ 13.C 생물·실험실 자산 (현미경·식물·세균)
  └─ 13.D 지구·환경 자산 (암석·기후·생태)
          ↓
Phase 14   신규 archetype 추가 (3개, 가능 62/67)
  ├─ 14.A pde_grid    (파동·확산·침식)
  ├─ 14.B monte_carlo (유전·입자 침착)
  └─ 14.C cellular_automata (결정 성장)
          ↓
Phase 15   특수 infra (가능 66/67)
  ├─ 15.A 광선 추적 (광학)
  ├─ 15.B 회로 솔버 (전기회로)
  └─ 15.C 변형 메쉬 (크레이터·화석)
```

각 Phase 끝에 **golden test 회귀 + 누적 커버리지 측정**.

---

## Phase 12 — A등급 회귀 검증 (현재 + 1주)

### Goal

이미 모든 자산이 갖춰진 11개 실험을 LLM 파이프라인이 자동 생성할 수 있는지 검증한다.

### 선행 블로커

- **Gemini SDK 400 에러** — curl은 200 OK이지만 SDK + 전체 tool registry로는 실패. 이걸 먼저 해결해야 자동생성 회귀가 의미 있음.
- 옵션 1: Anthropic Claude SDK로 provider 전환 (이미 packages/core 에 있음 — 우선 검토)
- 옵션 2: tool registry slim down (현재 너무 많은 tool 등록이 원인일 수 있음)
- 옵션 3: gemini-2.0-flash 같은 안정 모델로 재시도

### Deliverables

1. `packages/core/src/providers/` 진단 — 어느 provider가 안정적인지 결정
2. `test-cases/sim-test.ts` 에 신규 골든셋 5개 추가:
   - `phIndicatorGoldenCase` (interactive_protocol)
   - `reactionRateGoldenCase` (ode_system)
   - `populationGrowthGoldenCase` (ode_system, 로지스틱)
   - `invasiveSpeciesGoldenCase` (agent_based)
   - `naturalSelectionGoldenCase` (agent_based)
3. `npm run test all` 으로 8개 (기존 3 + 신규 5) 케이스 일괄 회귀 통과

### Verification

- 8개 케이스 각각: lint + typecheck + build + validation.test 모두 통과
- 시각적 spot check: 각 케이스 dev server 띄워서 1분 내 동작 확인
- Phase 11 결과 README 갱신 (커버리지 11/67 → 16%)

### Effort

3~5일

### Dependencies

- 없음 (현재 자산만으로 진행)

### Risks

- Gemini SDK 디버깅이 길어지면 일정 슬립. **mitigation**: 1일 timebox 후 안 풀리면 Claude provider로 전환.
- LLM이 생성한 코드 품질 편차 — fallback 으로 manual scaffolding 재실행 가능하게 해두기.

---

## Phase 13 — B등급 lab_object 일괄 추가 (3~4주)

### Goal

공유도 높은 신규 lab_object 약 20개를 templates에 추가해 49/67 (73%) 까지 커버.

각 lab_object는 strawberry/titration 패턴을 따른다:

- `<MeshTransmissionMaterial>` (유리류) 또는 `<LatheGeometry>` (회전체) 또는 텍스처드 Box
- props 인터페이스는 단일 numeric/stateful prop 위주, 추가 cosmetic prop 최소화
- `templates/modules/<archetype>/src/lab/lab_objects/<Name>.tsx` 에 배치
- index.ts barrel 갱신
- `docs/modules/<archetype>/template_api.md` 에 prop reference + 예시 1개

### Phase 13.A — 물리 운동학 자산 (1주)

**5개 실험 동시 해결**: Speed/Motion, Newton's Laws, Momentum Collision, Projectile Motion, Energy Conservation

**신규 lab_object**:

- `Cart` (4-바퀴 박스) — Speed/Motion, Newton, Momentum 공유
- `Track` (직선 레일, 길이 prop) — 위와 공유
- `Photogate` (트리거 박스, onPass 콜백) — 위와 공유
- `Pulley` + `HangingMass` + `String` (선분 mesh) — Newton's Laws
- `Cannon` + `Projectile` (포물선 trail) — Projectile Motion

**신규 visualization**:

- `EnergyBars` (KE/PE/총합 막대 그래프) — Energy Conservation

**Manual demo로 1개 검증** (예: `manual-cart-collision`)

**Verification**: 위 5개 실험 골든셋 추가 후 회귀 8 → 13개

---

### Phase 13.B — 화학·생물 공유 자산 (1주)

**8개 실험 해결**: Yeast Respiration, Catalase, Density Column, Solubility, Flame Test, Thermochemistry, Baking Soda, Gas Law Balloon

**신규 lab_object**:

- `BubbleStream` (CO₂/O₂ 기포 입자 — useFrame 기반) — Yeast, Catalase, Baking Soda 공유
- `Thermometer` (수은/디지털 막대) — 8/12 화학 실험 공유
- `HotPlate` (가열판, 온도 prop) — Solubility, Thermochem
- `BunsenBurner` + `Flame` (불꽃 색상 셰이더) — Flame Test
- `GraduatedCylinder` (눈금 실린더) — Density Column
- `LayeredLiquid` (z-스택 투명 슬랩) — Density Column
- `Calorimeter` (단열 컵) — Thermochem

**Manual demo로 1개 검증** (예: `manual-flame-test` 또는 `manual-density-column`)

**Verification**: 위 8개 골든셋 추가 후 회귀 13 → 21개

---

### Phase 13.C — 생물·실험실 자산 (1주)

**7개 실험 해결**: Microscope Cell, Cheek Cell, Osmosis Potato, Owl Pellet, Plant Growth, Transpiration, Bacterial Growth

**신규 lab_object**:

- `Microscope` (대물·접안 + 무대) — 2개 cell lab 공유
- `Slide` (유리 슬라이드)
- `CellImage` (확대 텍스처 평면, type prop으로 식물세포/동물세포 등 전환)
- `PotatoSlice` (실린더, 색 prop)
- `LeafySprig` (잎 + 줄기 mesh)
- `OwlPellet` + `TinyBone` (3~5종 골격 mesh) — 분류 게임용
- `PetriDish` (얕은 원판) — Bacterial Growth, 다른 실험에서도 활용
- `ColonyVis` (점-군집 instanced mesh, count prop)
- `Plant` (높이 스케일링 mesh) — Plant Growth, Transpiration

**Manual demo**: `manual-osmosis-potato` (B등급 hybrid 패턴 검증 — `BaseProtocol` + `RK4` 결합 첫 사례)

**Verification**: 위 7개 골든셋 추가 후 회귀 21 → 28개

---

### Phase 13.D — 지구·환경 자산 (1주)

**15개 실험 해결**: Rock ID, Mineral Hardness, Fossil ID, Volcano, Continental Drift, Greenhouse, Water Cycle, Soil Composition, Composting, Renewable Energy, Albedo, Water Filtration, Biodiversity Survey, Food Web, Habitat Fragmentation

**신규 lab_object** (15개 실험을 단 13개 자산으로 처리, 공유도 높음):

- `RockSample` 라이브러리 (3~5종 텍스처드 mesh) — Rock/Mineral/Fossil ID 공유
- `Magnifier` (반투명 렌즈)
- `ScratchTool` (강철·손톱·동전)
- `VolcanoModel` (cone) + `LavaParticles`
- `ContinentShape` (남미·아프리카 등 2D mesh + 스냅 게임)
- `ClosedChamber` (덮개 있는 컨테이너) — Greenhouse, Albedo 공유
- `Cloud` + `Raindrops` — Water Cycle
- `SoilColumn` (시간 분리 셰이더)
- `CompostBin`
- `SolarPanel`, `WindTurbine` (회전 mesh)
- `SurfacePatch` (검정/흰/풀)
- `FilterMedia` (모래·자갈·숯 층) — Water Filtration
- `HabitatScene` + `SpeciesNode` + `Barrier` — Biodiversity, Food Web, Habitat Fragmentation

**Manual demo**: `manual-greenhouse-effect` (단순 ODE — 검증용)

**Verification**: 위 15개 골든셋 추가 후 회귀 28 → 43개. 누적 커버리지 49/67 (73%).

### Phase 13 전체 검증

- LLM이 각 lab_object를 골라 사용하는지 확인 — `simulation-type-classifier.ts` 의 prompt에 lab_object 카탈로그 명시 추가
- 자산 사용률 체크: 각 lab_object가 최소 1개 골든셋에서 호출되는지 audit

### Effort

4주

### Dependencies

Phase 12 완료 (LLM provider 안정)

### Risks

- 자산이 늘어남에 따라 LLM context window 압박 — **mitigation**: lab_object 카탈로그를 archetype 별로 분리해서 분류기가 archetype 결정 후 해당 카탈로그만 주입
- 시각 품질 편차 — Manual demo로 한 archetype당 1개씩 spot check

---

## Phase 14 — 신규 archetype 3개 (3~6주)

### Goal

파이프라인 archetype을 6개 → 9개로 확장. 13개 실험 추가 커버.

각 archetype은 strawberry-pattern으로 추가:

1. **수동 데모 1개 빌드** (`output/manual-<demo>/`)
2. 패턴 추출해서 `templates/modules/<archetype>/` 으로 승격
3. `docs/modules/<archetype>/design_rules.md` + `template_api.md`
4. `simulation-type-classifier.ts` 에 archetype 추가 + disambiguation rule

### Phase 14.A — `pde_grid` archetype (2~3주, 최우선)

**ROI 가장 높음** — 6개 실험 한 번에 해결: Wave on String, Chromatography, Erosion, Glacier Movement, Oil Spill, Electromagnet (벡터장 변형)

**Deliverables**:

- 수동 데모: `manual-wave-on-string` (1D 파동방정식, ∂²u/∂t² = c² ∂²u/∂x²)
- 솔버: `BasePDE` (1D + 2D), `FiniteDifference` (음양 적분), `_TemplatePDE.ts`
- lab_object: `String1D` (격자 변형 mesh), `HeightField2D` (2D 그리드 surface)
- visualization: `HeatmapPanel` (2D 스칼라 색상), `ContourPlot` (등고선)
- 분류기 prompt에 archetype 추가

**검증 사례**: Wave on String + (LLM 자동생성) Chromatography 1D

**Effort**: 2~3주

---

### Phase 14.B — `monte_carlo` archetype (1~2주)

**2개 실험**: Punnett Square Genetics, Air Pollution Collection

**Deliverables**:

- 수동 데모: `manual-punnett-square` (대립유전자 무작위 샘플링 → 표현형 비율 히스토그램)
- 솔버: `BaseMC`, `_TemplateMC.ts`
- lab_object: `PunnettGrid` (2×2 격자), `AlleleToken` (드래그 가능 토큰), `StickyCard` (입자 침착판)
- visualization: `HistogramPanel`, `RunningMean` 차트
- 분류기 prompt 추가

**Effort**: 1~2주

---

### Phase 14.C — `cellular_automata` archetype (1~2주)

**1개 실험**: Crystal Growth (선택사항 — 이건 ODE/PDE로도 가능)

**Deliverables**:

- 수동 데모: `manual-crystal-growth` 또는 `manual-conways-life` (참조 구현)
- 솔버: `BaseCA`, `_TemplateCA.ts`
- lab_object: `CrystalLattice` (인스턴스드 mesh, alive/dead 상태)
- visualization: `GridPanel` (2D 셀 색상)
- 분류기 prompt 추가

**Effort**: 1~2주 (Phase 14.A·B의 패턴 재사용)

### Phase 14 전체 Verification

- 각 archetype에 대해 LLM 자동생성 케이스 1개씩 추가 → 회귀 통과
- 분류기가 6개 → 9개 archetype을 정확히 disambiguate (테스트셋: 각 archetype별 5문장 = 45개 분류 정확도 ≥ 90%)

### Effort

4~7주

### Dependencies

Phase 13 (lab_object 풀이 채워져야 LLM이 활용 가능)

### Risks

- PDE 안정성 — CFL 조건, 경계조건 처리. **mitigation**: 검증된 음양 적분기 사용 + 수치 진단 validator
- 분류기 정확도 저하 — archetype 늘면 헷갈림. **mitigation**: disambiguation rule을 archetype 추가 시마다 명시적으로 보강

---

## Phase 15 — 특수 infra (3~5주)

### Goal

나머지 4개 실험 커버: Lens & Optics, Electric Circuit, Crater Formation, Fossil Formation, Frog Dissection. 65/67 (97%) 또는 66/67 (Frog 제외 시).

### Phase 15.A — 광선 추적 (1~2주)

**1개 실험**: Lens and Optics

**Deliverables**:

- visualization layer: `LightRay` (선분 추적, 굴절·반사)
- lab_object: `ConvexLens`, `ConcaveLens`, `LightSource`, `Screen`
- 솔버: 광선 추적 휴리스틱 (정식 ray tracing 아니어도 OK — 얇은 렌즈 공식만)
- 수동 데모: `manual-lens-optics`

### Phase 15.B — 회로 솔버 (1~2주)

**1개 실험**: Electric Circuit Lab

**Deliverables**:

- 솔버: `CircuitSolver` (KCL/KVL 가우스 소거법) — 별도 archetype으로 추가
- lab_object: `Battery`, `Resistor`, `Wire`, `Switch`, `Voltmeter`, `Ammeter`, `Bulb` (밝기 prop)
- 인터랙션: 노드 연결 드래그 시스템
- 수동 데모: `manual-series-parallel-circuit`

**Note**: 이게 가장 비용 큼 — 노드/엣지 그래프 모델, 드래그 연결 UX, 회로 풀이 솔버 등 신규 구성요소 다수.

### Phase 15.C — 변형 메쉬 (1주)

**2개 실험**: Crater Formation, Fossil Formation

**Deliverables**:

- lab_object 패턴: `DeformableMesh` (vertices를 시간에 따라 변형)
- 응용: `SandSurface`, `ClaySlab`
- 수동 데모: `manual-crater-formation` (단순 임팩트 → 함몰 애니메이션)

### 제외 검토: Frog Dissection

대형 해부학 에셋이 필요해 ROI 매우 낮음. 1개 실험만 위해 frog rig + scalpel + organ 라벨 시스템 빌드는 비용 대비 효과 부족. **결정**: 67개 중 1개 (1.5%)는 의도적으로 미커버하거나 별도 외주.

### Phase 15 전체 Verification

- 광학·회로·크레이터 각 manual demo 동작
- 누적 커버리지 66/67 (97%)

### Effort

3~5주

### Dependencies

Phase 14 (archetype 풀 안정화)

### Risks

- Circuit solver는 archetype 단위로 추가하면 14에 포함되는 게 깔끔. 이 plan에서는 15에 두지만 14.D로 옮길 수도 있음.

---

## 누적 커버리지 진행

| 시점        | 자동생성 가능 | 비율 | 누적 작업           |
| ----------- | ------------- | ---- | ------------------- |
| 현재        | 11            | 16%  | (Phase 1~11 완료)   |
| Phase 12 후 | 11 (검증됨)   | 16%  | LLM 회귀 안정화     |
| Phase 13.A  | 16            | 24%  | + 운동학            |
| Phase 13.B  | 24            | 36%  | + 열·기포·연소      |
| Phase 13.C  | 31            | 46%  | + 현미경·식물·세균  |
| Phase 13.D  | 46            | 69%  | + 지구·환경         |
| Phase 14.A  | 52            | 78%  | + pde_grid          |
| Phase 14.B  | 54            | 81%  | + monte_carlo       |
| Phase 14.C  | 55            | 82%  | + cellular_automata |
| Phase 15.A  | 56            | 84%  | + 광학              |
| Phase 15.B  | 57            | 85%  | + 회로              |
| Phase 15.C  | 59            | 88%  | + 변형 메쉬         |

> Note: 비율이 분석 문서(99%)와 다른 이유 — 분석 문서는 "기술적으로 가능"한 비율이고, 위 표는 "골든셋 회귀까지 검증된" 누적 카운트. Hybrid 케이스(11개)는 Phase 13 안에서 자동 합성된다는 가정.

---

## 작업 흐름 권장사항

1. **각 sub-phase 시작 전**: 작은 plan 문서를 별도로 작성 (`docs/plans/phase-XX-Y.md`) — 본 로드맵은 마스터 컨트롤.
2. **각 lab_object 추가 시**: 항상 manual demo 한 개 같이 빌드해서 시각적 검증.
3. **각 archetype 추가 시**: classifier disambiguation 테스트 작성 → 회귀에 포함.
4. **Phase 종료 기준**: 골든셋 회귀 통과 + 시각 spot check + 본 문서 누적 표 갱신.

---

## 가장 먼저 결정할 것 (Phase 12 시작 전)

1. **Provider 결정** — Gemini SDK 디버깅 vs Claude로 전환?
2. **Phase 13 sub-phase 우선순위** — A(물리) / B(화학) / C(생물) / D(지구·환경) 중 어느 영역의 실험이 가장 먼저 필요한가? 사용자 데모 시나리오 기준으로 결정.
3. **Phase 15 frog dissection 처리** — 미커버 / 외주 / 단순 텍스처 정도로 처리?

이 3가지에 대한 user 결정을 받고 Phase 12부터 착수.
