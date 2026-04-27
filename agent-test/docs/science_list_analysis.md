# Science List Analysis — 파이프라인 커버리지 매핑

`docs/science_list.md` 의 67개 실험을 OpenSim 파이프라인이 모두 생성할 수 있는지 분석한다.

분류 축은 두 개:

1. **상호작용 유형 (UX)**
   - **I** = `interactive_protocol` 성격. 사용자가 단계마다 드래그/클릭하면서 절차를 따라가는 시뮬레이터. (예: 적정, DNA 추출)
   - **C** = `continuous` 성격. 다이얼/버튼으로 초기값 조정 후 Run/Pause/Reset 으로 돌리는 시뮬레이터. (예: 진자, Lotka–Volterra, 마찰 경사면)
   - **H** = 하이브리드. 인터랙티브한 셋업 단계 다음에 Run으로 연속 시뮬레이션이 돌아가는 형태. 둘을 합성.

2. **파이프라인 가능 등급**
   - **A** — 현재 템플릿/모듈만으로 즉시 생성 가능. (코어 + ode_system / agent_based / interactive_protocol 자산 활용)
   - **B** — 새 lab_object 또는 visualization 1~2개만 추가하면 됨. 솔버는 기존 archetype 재사용. (LLM이 하나하나 그리도록 시키기엔 무리이니 템플릿에 추가 권장)
   - **C** — 새 archetype 모듈 또는 큰 infra (deformable mesh, 광학 추적 등) 가 필요. 별도 Phase로 빌드해야 함.

---

## 자산 현황 (2026-04-27 기준)

### 코어 (모든 archetype 공용)

- 씬: `BaseLabScene` (책상 + 카메라 + 조명)
- 인스트루먼트: `Dial`, `Button3D`, `DigitalReadout`, `ChartMonitor`
- 인터랙션: `DragRotate`, `ClickPress`, `HoverInfo`, `labStore`
- 검증: `NaNDetector`, `checkUnitConsistency`, `checkConservation`, `compareToAnalytic`

### `ode_system` 모듈

- 솔버: `BaseODE`, `RK4`
- lab_object: `Pendulum`
- visualization: `TimeSeriesPlot`, `PhasePortrait`
- 검증된 사례: 감쇠 진자, Lotka–Volterra, 마찰 경사면

### `agent_based` 모듈

- 솔버: `BaseAgent`
- lab_object: `AgentSwarm` (boids)
- visualization: `TimeSeriesPlot`
- 검증된 사례: Boids flock

### `interactive_protocol` 모듈

- 솔버: `BaseProtocol`
- lab_object: `Beaker`, `ReagentBottle`, `Funnel`, `GlassRod`, `Bag`
- visualization: `PouringStream`, `Splash`, `PrecipitationCloud`, `InstructionPanel`, `StepIndicator`, `DropTargetRing`
- 인터랙션: `useDragOnPlane`
- 검증된 사례: 딸기 DNA 추출, 산-염기 적정

### **현재 없음 (새로 만들어야 할 archetype)**

- `pde_grid` — 1D/2D 편미분방정식 (열, 파동, 확산). 끈 위 파동 / 침식 / 글레이셔에 필요.
- `monte_carlo` — 확률적 샘플링 (유전, 입자 충돌). Punnett / 미세입자에 필요.
- `cellular_automata` — 격자 자동자 (Conway, 산불, 결정 성장). 결정 성장 / 박테리아 콜로니에 활용 가능.

---

## Biology (13개)

| #   | 실험                    | UX  | 등급  | 솔버                     | 재사용 자산                                                         | 신규 자산                                                                  |
| --- | ----------------------- | --- | ----- | ------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Microscope Cell Lab     | I   | **B** | `BaseProtocol`           | `BaseLabScene`, `Button3D`, `InstructionPanel`, `StepIndicator`     | `Microscope`, `Slide`, `CellImage` (확대 평면 텍스처)                      |
| 2   | Cheek Cell Lab          | I   | **B** | `BaseProtocol`           | 위와 동일 + `DropTargetRing`                                        | `Swab`, `CellImage` (치아세포 텍스처) — 1번과 거의 공유                    |
| 3   | Osmosis Potato Lab      | H   | **B** | `BaseProtocol` + `RK4`   | `Beaker`, `ReagentBottle`, `TimeSeriesPlot`, `Dial`                 | `PotatoSlice`, `MassReadout` (저울)                                        |
| 4   | Yeast Respiration Lab   | C   | **B** | `RK4` (1차 동역학)       | `Beaker`, `Dial`, `TimeSeriesPlot`, `Bag` (풍선 대체)               | `BubbleStream` (CO₂ 기포 입자), `ErlenmeyerFlask`                          |
| 5   | Enzyme Catalase Lab     | C   | **B** | `RK4` (Michaelis–Menten) | `Beaker`, `Dial`, `TimeSeriesPlot`                                  | `BubbleStream` (4번 공유), `Cuvette` (선택)                                |
| 6   | DNA Extraction Lab      | I   | **A** | `BaseProtocol`           | 전부 (이미 구현됨)                                                  | —                                                                          |
| 7   | Punnett Square Genetics | I/C | **C** | `monte_carlo` (없음)     | `Button3D`, `DigitalReadout`                                        | **새 archetype 필요** + `PunnettGrid`, `AlleleToken`                       |
| 8   | Natural Selection Sim   | C   | **A** | `BaseAgent`              | `AgentSwarm`, `Dial`, `TimeSeriesPlot`                              | (기존 boids 변형으로 가능 — 형질 컬러 매핑만)                              |
| 9   | Bacterial Growth Lab    | C   | **B** | `RK4` (로지스틱)         | `Dial`, `TimeSeriesPlot`                                            | `PetriDish`, `ColonyVis` (점-군집 성장 텍스처)                             |
| 10  | Plant Growth Experiment | C   | **B** | `RK4`                    | `Dial`, `Button3D`, `TimeSeriesPlot`                                | `Plant` (높이 스케일링 메쉬), `LightSource`                                |
| 11  | Transpiration Lab       | C   | **B** | `RK4`                    | `Beaker`, `Dial`, `TimeSeriesPlot`                                  | `LeafySprig`, `CapillaryTube` (수위 마커)                                  |
| 12  | Owl Pellet Lab          | I   | **B** | `BaseProtocol`           | `BaseLabScene`, `useDragOnPlane`, `DropTargetRing`, `StepIndicator` | `OwlPellet`, `TinyBone` (3~5종), `SortingMat`                              |
| 13  | Frog Dissection Lab     | I   | **C** | `BaseProtocol`           | `useDragOnPlane`, `StepIndicator`                                   | `Frog3D` (해부 가능한 다층 메쉬), `Scalpel`, `Organ` 라벨 — 모델링 부담 큼 |

---

## Chemistry (12개)

| #   | 실험                   | UX  | 등급  | 솔버                   | 재사용 자산                                                 | 신규 자산                                                |
| --- | ---------------------- | --- | ----- | ---------------------- | ----------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Baking Soda Reaction   | I   | **B** | `BaseProtocol`         | `Beaker`, `ReagentBottle`, `Bag`, `PouringStream`, `Splash` | `BubbleStream` (CO₂)                                     |
| 2   | pH Indicator Lab       | I   | **A** | `BaseProtocol`         | 전부 — 적정 시뮬과 거의 동일, 색만 다름                     | —                                                        |
| 3   | Acid–Base Titration    | I   | **A** | `BaseProtocol`         | 전부 (이미 구현됨)                                          | —                                                        |
| 4   | Density Column Lab     | I   | **B** | `BaseProtocol`         | `ReagentBottle`, `PouringStream`                            | `GraduatedCylinder`, `LayeredLiquid` (z-스택 투명 슬랩)  |
| 5   | Solubility Lab         | H   | **B** | `BaseProtocol` + `RK4` | `Beaker`, `Dial` (온도), `TimeSeriesPlot`                   | `HotPlate`, `SoluteParticles` (점차 사라지는 입자)       |
| 6   | Precipitation Reaction | I   | **A** | `BaseProtocol`         | 전부 (`PrecipitationCloud` 이미 있음)                       | —                                                        |
| 7   | Flame Test Lab         | I   | **B** | `BaseProtocol`         | `useDragOnPlane`, `StepIndicator`                           | `BunsenBurner`, `Flame` (색상 매핑 셰이더), `WireLoop`   |
| 8   | Reaction Rate Lab      | C   | **A** | `RK4`                  | `Beaker`, `Dial`, `TimeSeriesPlot`                          | (없음)                                                   |
| 9   | Gas Law Balloon Lab    | C   | **B** | `RK4` (이상기체)       | `Bag` (풍선 재사용), `Dial`, `DigitalReadout`               | `Thermostat` (온도 제어 박스)                            |
| 10  | Chromatography Lab     | H   | **C** | `pde_grid` (확산)      | `Beaker`, `useDragOnPlane`                                  | **새 archetype 필요** + `ChromatographyPaper` (1D 색 띠) |
| 11  | Crystal Growth Lab     | C   | **C** | `cellular_automata`    | `Beaker`, `Dial`                                            | **새 archetype 필요** + `CrystalLattice` (성장형 메쉬)   |
| 12  | Thermochemistry Lab    | I   | **B** | `BaseProtocol` + `RK4` | `Beaker`, `ReagentBottle`, `TimeSeriesPlot`                 | `Thermometer`, `Calorimeter` (단열 컵)                   |

---

## Physics (12개)

| #   | 실험                    | UX  | 등급  | 솔버                            | 재사용 자산                                            | 신규 자산                                                                                            |
| --- | ----------------------- | --- | ----- | ------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | Lens and Optics Lab     | I/C | **C** | 광선 추적 (커스텀)              | `Dial`, `useDragOnPlane`                               | `Lens` (얇은 렌즈 표면), `LightRay` (선분 추적) — 새 visualization layer                             |
| 2   | Speed and Motion Lab    | C   | **B** | `RK4`                           | `Dial`, `Button3D`, `DigitalReadout`, `TimeSeriesPlot` | `Cart`, `Track` (직선 레일), `Photogate` (트리거 박스)                                               |
| 3   | Newton's Laws Lab       | C   | **B** | `RK4`                           | `Cart`, `Track` (#2 공유), `Dial`                      | `Pulley`, `HangingMass`, `String` (선분)                                                             |
| 4   | Projectile Motion Lab   | C   | **B** | `RK4`                           | `Dial`, `Button3D`, `TimeSeriesPlot`, `PhasePortrait`  | `Cannon`, `Projectile` (포물선 트레일)                                                               |
| 5   | Gravity Lab             | C   | **A** | `RK4`                           | 진자 자산 전부 (g 측정 = 진자 주기 역산)               | —                                                                                                    |
| 6   | Friction Lab            | C   | **A** | `RK4`                           | 전부 (이미 구현됨)                                     | —                                                                                                    |
| 7   | Pendulum Period Lab     | C   | **A** | `RK4`                           | 진자 자산 전부                                         | —                                                                                                    |
| 8   | Energy Conservation Lab | C   | **B** | `RK4`                           | 진자 + `TimeSeriesPlot`, `ChartMonitor`                | `EnergyBars` (KE/PE/총 막대 그래프 — 작은 신규 viz)                                                  |
| 9   | Momentum Collision Lab  | C   | **B** | `RK4`                           | `Cart`, `Track` (#2 공유), `DigitalReadout`            | `CollisionDetector` (간단 충돌 + 반발계수)                                                           |
| 10  | Electric Circuit Lab    | I/C | **C** | 회로 솔버 (없음)                | `useDragOnPlane`, `Button3D`                           | **새 archetype** + `Battery`, `Resistor`, `Wire`, `Switch`, `Voltmeter`, `Ammeter`, `Bulb` — 부담 큼 |
| 11  | Electromagnet Lab       | C   | **C** | `pde_grid` (벡터장) 또는 해석해 | `Dial` (전류)                                          | **새 archetype 필요** + `Coil`, `IronCore`, `IronFiling` (입자 정렬)                                 |
| 12  | Wave on String Lab      | C   | **C** | `pde_grid` (1D 파동방정식)      | `Dial`, `Button3D`, `ChartMonitor`                     | **새 archetype 필요** + `String1D` (격자 변형 메쉬)                                                  |

---

## Earth Science (9개)

| #   | 실험                     | UX  | 등급  | 솔버                     | 재사용 자산                                                             | 신규 자산                                          |
| --- | ------------------------ | --- | ----- | ------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | Rock Identification      | I   | **B** | `BaseProtocol`           | `useDragOnPlane`, `DropTargetRing`, `StepIndicator`, `InstructionPanel` | `RockSample` (3~5종 텍스처드 메쉬), `Magnifier`    |
| 2   | Mineral Hardness         | I   | **B** | `BaseProtocol`           | 위와 동일                                                               | `MineralSample`, `ScratchTool` (강철, 손톱, 동전)  |
| 3   | Volcano Eruption Model   | I   | **B** | `BaseProtocol`           | `Beaker`, `ReagentBottle`, `PouringStream`                              | `VolcanoModel` (cone), `LavaParticles`             |
| 4   | Water Cycle Model        | C   | **B** | `RK4` (질량보존)         | `Dial`, `TimeSeriesPlot`                                                | `Terrarium` (밀폐 유리 박스), `Cloud`, `Raindrops` |
| 5   | Crater Formation Lab     | C   | **C** | `RK4` 충격 + 변형 메쉬   | `Dial`, `Button3D`                                                      | **변형 가능 SandSurface 필요** — 부담 큼           |
| 6   | Fossil Identification    | I   | **B** | `BaseProtocol`           | Rock ID 자산 공유                                                       | `FossilSample` 텍스처                              |
| 7   | Fossil Formation Lab     | I   | **C** | `BaseProtocol`           | `useDragOnPlane`, `StepIndicator`                                       | `ClaySlab` (변형 메쉬 — 압인 시 함몰), `Shell`     |
| 8   | Glacier Movement Lab     | C   | **C** | `pde_grid` (점탄성 흐름) | —                                                                       | **새 archetype 필요** + `Terrain`, `IceMass`       |
| 9   | Continental Drift Puzzle | I   | **B** | `BaseProtocol`           | `useDragOnPlane`, `StepIndicator`                                       | `ContinentShape` (남미/아프리카 등 2D 메쉬 + 스냅) |

---

## Environmental Science (17개)

| #   | 실험                     | UX  | 등급  | 솔버                                | 재사용 자산                                                  | 신규 자산                                                |
| --- | ------------------------ | --- | ----- | ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 1   | Water Quality Testing    | I   | **A** | `BaseProtocol`                      | `Beaker`, `ReagentBottle`, `DigitalReadout`, `StepIndicator` | (지표 색상만 변경)                                       |
| 2   | Water Filtration Lab     | I   | **B** | `BaseProtocol`                      | `Funnel`, `Beaker`, `useDragOnPlane`, `PouringStream`        | `FilterMedia` (모래/자갈/숯 층)                          |
| 3   | Oil Spill Simulation     | H   | **C** | `pde_grid` (확산) 또는 `BaseAgent`  | `useDragOnPlane`, `Beaker` (수조), `Dial`                    | **새 archetype 필요** 또는 agent_based 변형 + `OilPatch` |
| 4   | Air Pollution Collection | I/C | **C** | `monte_carlo` 입자 침착             | `useDragOnPlane`, `Dial`                                     | **새 archetype 필요** + `StickyCard`, `ParticleField`    |
| 5   | Greenhouse Effect Lab    | C   | **B** | `RK4` (열교환)                      | `Dial`, `TimeSeriesPlot`, `DigitalReadout`                   | `ClosedChamber` (덮개 있는 컨테이너 2개)                 |
| 6   | Soil Composition Lab     | C   | **B** | `RK4` (Stokes 침강)                 | `Beaker`, `TimeSeriesPlot`                                   | `SoilColumn` (시간에 따라 분리되는 층 셰이더)            |
| 7   | Soil pH Lab              | I   | **A** | `BaseProtocol`                      | Chemistry pH Indicator 자산 그대로                           | —                                                        |
| 8   | Erosion Lab              | C   | **C** | `pde_grid` 또는 `cellular_automata` | `Dial`                                                       | **새 archetype 필요** + `SoilTerrain` (변형)             |
| 9   | Runoff Pollution Lab     | C   | **C** | 위와 동일 + tracer                  | Erosion 자산 공유                                            | `PollutantTracer`                                        |
| 10  | Biodiversity Survey Lab  | I   | **B** | `BaseProtocol`                      | `useDragOnPlane`, `DigitalReadout`, `StepIndicator`          | `HabitatScene` (식물/동물 sprite 다수), `SpeciesTally`   |
| 11  | Food Web Lab             | I/C | **B** | `BaseAgent` 변형 또는 그래프        | `Button3D`, `DigitalReadout`                                 | `SpeciesNode` + `EnergyArrow` (그래프 시각화)            |
| 12  | Population Growth Lab    | C   | **A** | `RK4` (로지스틱)                    | LV 자산 그대로                                               | —                                                        |
| 13  | Invasive Species Sim     | C   | **A** | `BaseAgent`                         | `AgentSwarm` (변형, 두 종)                                   | (기존 자산 충분)                                         |
| 14  | Habitat Fragmentation    | I/C | **B** | `BaseAgent` + `BaseProtocol`        | `AgentSwarm`, `useDragOnPlane`                               | `HabitatPatch` (분할 가능 영역), `Barrier`               |
| 15  | Composting Lab           | C   | **B** | `RK4`                               | `Dial`, `TimeSeriesPlot`                                     | `CompostBin`, `OrganicWaste` (사라지는 입자)             |
| 16  | Renewable Energy Lab     | C   | **B** | `RK4`                               | `Dial`, `TimeSeriesPlot`, `DigitalReadout`                   | `SolarPanel`, `WindTurbine` (회전 메쉬)                  |
| 17  | Albedo Effect Lab        | C   | **B** | `RK4`                               | Greenhouse 자산 공유                                         | `SurfacePatch` (검정/흰/풀)                              |

---

## 종합 요약

### UX 분류 집계

| 분류                | 개수 | 의미                                                            |
| ------------------- | ---- | --------------------------------------------------------------- |
| **I (interactive)** | 26   | `interactive_protocol` archetype 사용                           |
| **C (continuous)**  | 30   | `ode_system` / `agent_based` / `pde_grid` 등 사용               |
| **H/I+C (hybrid)**  | 11   | 인터랙티브 셋업 → Run 합성 (BaseProtocol + 다른 archetype 결합) |

### 등급 분류 집계

| 등급                    | 개수 | 비율 | 액션                                    |
| ----------------------- | ---- | ---- | --------------------------------------- |
| **A** (즉시 가능)       | 11   | 16%  | LLM 프롬프트만 잘 짜면 됨               |
| **B** (lab_object 추가) | 38   | 57%  | 신규 lab_object를 templates에 점진 추가 |
| **C** (archetype 필요)  | 18   | 27%  | 아래 우선순위 작업 필요                 |

### 등급-A (현재 파이프라인 즉시 가능 — 11개)

이미 모든 자산이 갖춰져 있어 LLM 프롬프트만으로 생성 가능:

- 생물: DNA Extraction
- 화학: pH Indicator, Acid-Base Titration, Reaction Rate, Precipitation Reaction
- 물리: Gravity, Friction, Pendulum Period
- 환경: Water Quality, Soil pH, Population Growth, Invasive Species
- 생물(추가): Natural Selection (boids 변형)

### 등급-B로 가기 위한 권장 신규 lab_object (~ 20개, 우선순위 순)

물리/공통:

1. `Cart` + `Track` + `Photogate` (#2,3,9 공유) — 운동학 실험 3종 동시 해결
2. `BubbleStream` (CO₂/O₂ 기포 — 화학3종, 생물1종 공유)
3. `Thermometer` / `HotPlate` — 화학/생물/환경 다수 공유
4. `EnergyBars` — Energy Conservation
5. `BunsenBurner` + `Flame` — Flame Test
6. `Plant` (스케일링 메쉬) — Plant Growth, Transpiration

생물/실험실: 7. `Microscope` + `Slide` + `CellImage` — Cell Lab 2종 공유 8. `PotatoSlice`, `LeafySprig`, `OwlPellet`, `TinyBone` 9. `PetriDish` + `ColonyVis` — Bacterial Growth

지구과학: 10. `RockSample` 라이브러리 + `Magnifier` — Rock/Mineral/Fossil ID 3종 공유 11. `VolcanoModel` + `LavaParticles` 12. `ContinentShape` (스냅 가능 2D 메쉬)

환경: 13. `ClosedChamber` + `Cloud` + `Raindrops` — Greenhouse / Water Cycle 공유 14. `SoilColumn`, `CompostBin`, `SolarPanel`, `WindTurbine`, `SurfacePatch`

화학: 15. `GraduatedCylinder` + `LayeredLiquid` 16. `Calorimeter`

### 등급-C (새 archetype/infra 필요 — 18개)

이게 파이프라인 전면 커버를 가로막는 핵심 블로커. 우선순위:

| 우선순위 | 모듈/Infra                                         | 커버하는 실험                                                                       |
| -------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **1**    | `pde_grid` archetype (1D/2D 격자 + 음양 시간적분)  | Wave on String, Chromatography, Erosion, Glacier Movement, Oil Spill, Electromagnet |
| **2**    | `monte_carlo` archetype (확률 샘플링 + 히스토그램) | Punnett Square, Air Pollution Collection                                            |
| **3**    | `cellular_automata` archetype (격자 상태 머신)     | Crystal Growth (선택), Erosion 대안                                                 |
| **4**    | `RayTracer` visualization layer (광선 추적)        | Lens and Optics                                                                     |
| **5**    | `circuit_solver` archetype (KCL/KVL)               | Electric Circuit Lab                                                                |
| **6**    | `DeformableMesh` lab_object infra (변형 가능 표면) | Crater Formation, Fossil Formation, Erosion 보강                                    |
| **7**    | `Frog3D` 같은 대형 해부학 에셋                     | Frog Dissection (단일 실험만 — 비용 대비 ROI 낮음)                                  |

---

## 결론 — 파이프라인 완성을 위한 로드맵 제안

**Phase 12** (현재 다음): 등급-A 케이스 LLM 자동생성 검증

- pendulum / boids / friction / titration 외에 5~6개 등급-A 케이스를 sim-test 골든셋에 추가
- Gemini SDK 정상 동작 확인 후 일괄 회귀

**Phase 13**: 등급-B 신규 lab_object 일괄 추가

- 위 20개 중 공유도 높은 순서로 (Cart/Track > Microscope > Thermometer > Plant > RockSample > ...)
- 각 lab_object는 strawberry/titration 패턴대로 `<MeshTransmissionMaterial>` / Lathe / 텍스처드 Box 활용
- templates/modules/\* 의 lab_objects 디렉토리에 배치, classifier prompt 업데이트로 LLM이 활용하도록

**Phase 14**: 새 archetype 추가 (pde_grid → monte_carlo → cellular_automata 순)

- 각 archetype에 대해 strawberry-pattern으로:
  1. 수동 데모 1개 빌드 (예: pde_grid → Wave on String)
  2. 패턴 추출해서 templates/modules/<archetype>/ 로 승격
  3. 디자인룰/템플릿 API 문서 작성
  4. classifier에 archetype 추가 (현재 6 → 7,8,9개)

**Phase 15**: 특수 infra

- 광선 추적, 회로 솔버, deformable mesh — 각각 Phase 1개씩

**총 예상 커버리지**:

- 현재: 16% (11개)
- Phase 13 후: 73% (49개)
- Phase 14 후: 92% (62개)
- Phase 15 후: ~99% (66개, frog dissection 제외)
