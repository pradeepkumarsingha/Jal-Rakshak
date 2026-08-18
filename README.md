# Jal Rakshak Frontend - Comprehensive Implementation Plan

Build the complete, production-grade, highly interactive frontend for **Jal Rakshak** - an AI-powered flood intelligence and emergency response system for India.

---

## User Review Required

> [!IMPORTANT]
> - **Portals Included**: Citizen Portal, Admin Command Center, and Field Rescue Operations Portal + Public Portal.
> - **Multilingual Support**: English (`en`), Hindi (`hi`), and Odia (`or`) with instant in-app language switching.
> - **Simulation Mode & Offline Fallback**: In addition to standard API integration with Axios & TanStack React Query, all pages include built-in fallback handlers and an interactive **Scenario Simulator** (Normal State, Heavy Monsoon Alert, Severe Flash Flood Red Alert) so all interactive features, map markers, alerts, and AI responses can be demonstrated and tested end-to-end immediately even before backend startup.
> - **Interactive GIS Mapping**: Leaflet maps with custom styled markers, flood risk heat zones, water depth gauge popups, shelter status indicators, rescue boat markers, and route navigation.

---

## Architecture & Component Breakdown

### 1. Design System & Theming (`tailwind.config.js`, `src/styles/`)
- **Emergency Severity Palette**:
  - `CRITICAL`: `#DC2626` (Red-600)
  - `HIGH`: `#EA580C` (Orange-600)
  - `MEDIUM`: `#CA8A04` (Yellow-600)
  - `MODERATE`: `#84CC16` (Lime-500)
  - `LOW`: `#16A34A` (Green-600)
  - `NORMAL`: `#0891B2` (Cyan-600)
- **UI & Map Theme**: Water blue gradients (`#0284C7`, `#2563EB`, `#1D4ED8`), deep slate command dark mode accents (`#0F172A`, `#1E293B`), glassmorphism, radar pulse keyframes, and high-contrast accessible cards.
- **Typography**: Google Fonts Inter and Outfit/Poppins.

### 2. Localization & i18n (`src/locales/`, `src/context/LanguageContext.jsx`, `src/i18n.js`)
- Full translation keys for English, Hindi, and Odia across:
  - Navigation & Headers
  - Flood risk terms (Warning, Danger level, Evacuation, Safe ground)
  - Emergency SOS categories & instructions
  - Shelter details & facilities
  - AI Assistant greetings and suggested prompts

### 3. Context & Global State (`src/context/`)
- `AuthContext.jsx`: User profile, JWT persistence, role-based authorization (`citizen`, `admin`, `rescue`), 1-click demo persona quick-switcher.
- `LanguageContext.jsx`: Current locale, switch language, helper translation functions.
- `AlertContext.jsx`: Broadcast alerts queue, high-priority siren banner, notification toasts.
- `FloodDataContext.jsx`: Central state holding live simulated water levels, river gauge telemetry (Mahanadi, Brahmaputra, Ganga, Yamuna), active SOS incidents, community crowd-sourced reports, shelter occupancy, and scenario triggers.

### 4. API Services Layer (`src/services/` & `src/utils/mockData.js`)
- `api.js`: Axios instance with JWT interceptor and base URL configuration.
- `authApi.js`: Login, register, profile, demo accounts.
- `floodApi.js`: Risk score by coordinates/district, 24h predictive hydrograph forecast, reservoir discharge levels.
- `gisApi.js`: Risk zones geoJSON, safe evacuation pathfinder algorithm with submerged road avoidance.
- `reportApi.js`: Citizen crowd-sourcing submission with mock AI image depth verification.
- `emergencyApi.js`: 5-step SOS dispatch, priority score calculator, team assignment.
- `shelterApi.js`: Verified relief shelters, capacity, supplies inventory, distance calculation.
- `assistantApi.js`: AI flood assistant LLM response simulation with domain-specific flood defense knowledge, citations, and emergency guidelines.

### 5. Components Matrix (`src/components/`)
- **Common**:
  - `Navbar.jsx`: Brand logo, portal quick switch, language dropdown, notification bell with badge, user menu, emergency SOS quick trigger.
  - `Sidebar.jsx`: Collapsible command navigation for Admin & Rescue portals.
  - `Footer.jsx`: Disaster helpline numbers (NDRF 1078, SDRF 1070, Police 112), emergency links, NDMA compliance notice.
  - `Loading.jsx`, `ErrorBoundary.jsx`, `LanguageSelector.jsx`, `AudioAlert.jsx`.
- **Citizen Components**:
  - `RiskCard.jsx`: Circular radial score meter, severity level indicator, contributing weather factors, and last telemetry update.
  - `AlertBanner.jsx`: Emergency banner with animated alert pulse, sound indicator, dismiss & detail drawer.
  - `ShelterCard.jsx`: Distance, occupancy meter, facility badges (Medical, Women/Children Safe, Food, Generator), "Get Safe Route" action.
  - `EmergencyCard.jsx`: SOS summary, priority badge, victim demographics, rescue status tracker.
  - `ReportForm.jsx`: Crowd hazard submission with GPS coordinate detector.
  - `ImageUpload.jsx`: Drag-and-drop image uploader with instant AI flood depth detection preview.
  - `ForecastTimeline.jsx`: 24-hour predictive timeline with rain intensity & flood water projection.
- **Admin Components**:
  - `StatCard.jsx`: Metric values with trend pills, sparklines, and status colors.
  - `EmergencyTable.jsx`: Filterable triage table with priority scoring and direct dispatch button.
  - `ReportVerificationCard.jsx`: Side-by-side citizen report verification with AI confidence meter and approval actions.
  - `ShelterManagementCard.jsx`: Relief shelter capacity meter, supplies inventory status, and vacancy toggle.
  - `AlertBroadcastModal.jsx`: Emergency broadcast creator (SMS, Push, Siren).
- **Rescue Components**:
  - `AssignmentCard.jsx`: Tactical rescue card with victim count, medical flags, water depth, and step-by-step dispatch status toggle (`DISPATCHED` -> `EN ROUTE` -> `ON SCENE` -> `RESCUED` -> `CLOSED`).
  - `PriorityBadge.jsx`: Color-coded urgency tag (P1 Critical, P2 High, P3 Medium, P4 Low).
  - `RouteDisplay.jsx`: Turn-by-turn flood-safe tactical waypoint guidance.
- **Maps (`src/components/maps/`)**:
  - `FloodRiskMap.jsx`: Leaflet map with custom layer controls (Flood Zones, Relief Shelters, Live Reports, SOS Emergencies, Rescue Units).
  - `MapLegend.jsx`: Visual color-coded severity guide.
  - `MapControls.jsx`: Layer toggles, GPS locate me, flood time-slider (+0h, +6h, +12h, +24h).
- **AI Assistant (`src/components/ai/`)**:
  - `ChatInterface.jsx`: Conversational UI with streaming/typing effect, quick prompt pills, source citations (NDMA, CWC, IMD), and emergency actionable cards.

### 6. Pages Matrix (`src/pages/`)
- **Public**:
  - `Landing.jsx`: Hero with live disaster ticker, scenario preview, portal cards, key statistics, helpline directory.
  - `Login.jsx`: Multi-role login with 1-click test persona quick-logins.
  - `Register.jsx`: Multi-step registration with district picker and emergency contact setup.
- **Citizen Portal**:
  - `CitizenDashboard.jsx`: Central citizen command hub with live risk meter, forecast timeline, alert banner, telemetry gauges, and quick action cards.
  - `FloodMap.jsx`: Fullscreen interactive flood intelligence map.
  - `ShelterFinder.jsx`: Shelter locator with live vacancy & facility filters.
  - `SafeRoute.jsx`: Flood-safe pathfinder avoiding submerged streets.
  - `ReportFlood.jsx`: Crowd flood reporting with image AI depth assessment.
  - `EmergencyRequest.jsx`: 5-step SOS distress beacon wizard.
  - `AIChat.jsx`: Dedicated AI flood advisor interface.
- **Admin Portal**:
  - `AdminDashboard.jsx`: Command room KPI metrics, live situational GIS map, hydrograph inflow vs outflow Recharts, and incident feed.
  - `ReportsManagement.jsx`: Citizen report AI verification & triage queue.
  - `EmergencyManagement.jsx`: Master SOS triage, priority sorting, and team dispatch.
  - `ShelterManagement.jsx`: Shelter capacity & supply inventory tracking.
  - `Analytics.jsx`: AI prediction vs actual water level analytics, evacuation efficiency metrics.
- **Rescue Portal**:
  - `RescueDashboard.jsx`: Rescue squad readiness, assigned missions list, and quick status controls.
  - `AssignedRequests.jsx`: In-depth tactical mission execution view with navigation and victim verification.

---

## Proposed Changes

| Component | Files | Action |
|-----------|-------|--------|
| **Styling & Assets** | `tailwind.config.js`, `src/styles/index.css`, `src/styles/variables.css`, `index.html` | Configure custom colors, fonts (Inter & Poppins), animations, Leaflet styles |
| **i18n & Locales** | `src/i18n.js`, `src/locales/en.json`, `src/locales/hi.json`, `src/locales/or.json` | Multilingual translation bundles |
| **Data & Mock Engine** | `src/utils/constants.js`, `src/utils/helpers.js`, `src/utils/mockData.js` | Realistic flood telemetry, shelters, reports, SOS incidents, simulation logic |
| **Contexts** | `src/context/AuthContext.jsx`, `src/context/LanguageContext.jsx`, `src/context/AlertContext.jsx`, `src/context/FloodDataContext.jsx` | State management for auth, i18n, alerts, and live flood data |
| **Services** | `src/services/api.js`, `authApi.js`, `floodApi.js`, `gisApi.js`, `reportApi.js`, `emergencyApi.js`, `shelterApi.js`, `assistantApi.js` | API client with seamless mock fallback |
| **Common Components** | `Navbar.jsx`, `Sidebar.jsx`, `Footer.jsx`, `Loading.jsx`, `ErrorBoundary.jsx`, `LanguageSelector.jsx`, `AudioAlert.jsx` | Modern navigation and chrome |
| **Citizen Components** | `RiskCard.jsx`, `AlertBanner.jsx`, `ShelterCard.jsx`, `EmergencyCard.jsx`, `ReportForm.jsx`, `ImageUpload.jsx`, `ForecastTimeline.jsx` | Citizen UI cards and widgets |
| **Admin Components** | `StatCard.jsx`, `EmergencyTable.jsx`, `ReportVerificationCard.jsx`, `ShelterManagementCard.jsx`, `AlertBroadcastModal.jsx` | Command center components |
| **Rescue Components** | `AssignmentCard.jsx`, `PriorityBadge.jsx`, `RouteDisplay.jsx` | Tactical rescue components |
| **Map Components** | `FloodRiskMap.jsx`, `MapLegend.jsx`, `MapControls.jsx` | Leaflet GIS interactive map |
| **AI Components** | `ChatInterface.jsx`, `ChatMessage.jsx`, `ChatInput.jsx` | Jal Rakshak AI flood chatbot |
| **Layouts** | `CitizenLayout.jsx`, `AdminLayout.jsx`, `RescueLayout.jsx`, `PublicLayout.jsx` | Role-based responsive layouts |
| **Pages** | `Landing.jsx`, `Login.jsx`, `Register.jsx`, `CitizenDashboard.jsx`, `FloodMap.jsx`, `ShelterFinder.jsx`, `SafeRoute.jsx`, `ReportFlood.jsx`, `EmergencyRequest.jsx`, `AIChat.jsx`, `AdminDashboard.jsx`, `ReportsManagement.jsx`, `EmergencyManagement.jsx`, `ShelterManagement.jsx`, `Analytics.jsx`, `RescueDashboard.jsx`, `AssignedRequests.jsx` | Complete page suite |
| **Router & App** | `src/routes.jsx`, `src/App.jsx`, `src/main.jsx` | Setup React Query, React Router v6, protected role routes, 404 fallback |

---

## Verification Plan

### Automated Build Verification
- Execute `npm run build` to verify clean compilation with zero syntax or bundling errors.

### Manual & Interactive Verification
- Verify Public Landing page, test 1-click login for Citizen, Admin, and Rescue roles.
- Verify Citizen Dashboard: Risk meter gauge, 24h timeline, emergency alerts, river telemetry.
- Verify Interactive Leaflet Map: Layer toggling (Risk zones, shelters, reports, SOS), zoom, popup cards, time-lapse slider.
- Verify 5-Step SOS Emergency Request wizard: Complete submission and verify that the SOS immediately appears on the Admin Emergency Management table and Rescue Assigned Missions list!
- Verify Report Flood crowd-sourcing with AI photo depth analysis preview.
- Verify Shelter Finder with real-time distance and facility filtering.
- Verify Safe Evacuation Route generator avoiding flood zones.
- Verify AI Chat Assistant with multilingual prompts and suggested queries.
- Verify Admin Command Center: KPI metrics, Hydrograph charts, report verification queue, broadcast alert modal.
- Verify Rescue Portal: Mission status transitions (`DISPATCHED` -> `RESCUED`).
- Verify instant Language switcher (English / Hindi / Odia).
