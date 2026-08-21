import os
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

import httpx
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

# ============================================================
# CONFIGURATION
# ============================================================

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

OPENROUTESERVICE_BASE_URL = os.getenv(
    "OPENROUTESERVICE_BASE_URL",
    "https://api.openrouteservice.org"
)

OPENROUTESERVICE_API_KEY = os.getenv(
    "OPENROUTESERVICE_API_KEY",
    ""
)

APP_ENV = os.getenv("APP_ENV", "development")


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="Jal Rakshak AI Microservice",
    description=(
        "Flood intelligence, weather-based baseline risk estimation, "
        "emergency triage, route-service integration, and AI assistant."
    ),
    version="2.0.0"
)

# For development, allow local backend and frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "http://127.0.0.1:5000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# SCHEMAS
# ============================================================

class FloodPredictRequest(BaseModel):
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)

    location: Optional[str] = None
    locationName: Optional[str] = None
    coordinates: Optional[List[float]] = None

    rainfallForecastMm: Optional[float] = Field(default=None, ge=0)
    soilSaturationPct: Optional[float] = Field(default=None, ge=0, le=100)
    riverDischargeCusecs: Optional[float] = Field(default=None, ge=0)

    simulationMode: bool = False


class PriorityRequest(BaseModel):
    totalPeople: int = Field(default=1, ge=1)
    victims: Dict[str, int] = Field(default_factory=dict)
    medicalEmergency: bool = False
    waterSeverity: str = "MEDIUM"
    waterDepth: str = "Unknown"
    roadAccess: str = "UNKNOWN"
    locationRiskScore: Optional[float] = Field(default=None, ge=0, le=100)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    chat_history: List[ChatMessage] = Field(default_factory=list)
    location: Optional[Dict[str, Any]] = None
    scenario: str = "Live Real-Time Monitoring"


class SafeRouteRequest(BaseModel):
    origin: Dict[str, Any]
    destination: Dict[str, Any]

    # Valid OpenRouteService profiles: foot-walking, driving-car, cycling-regular, wheelchair
    mode: str = "foot-walking"

    avoidFloodZones: bool = True
    avoidPolygon: Optional[Dict[str, Any]] = None
    simulationMode: bool = False


# ============================================================
# COMMON HELPERS
# ============================================================

def now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()


def validate_coordinate_pair(latitude: float, longitude: float) -> None:
    if not (-90 <= latitude <= 90):
        raise HTTPException(
            status_code=422,
            detail="Latitude must be between -90 and 90."
        )

    if not (-180 <= longitude <= 180):
        raise HTTPException(
            status_code=422,
            detail="Longitude must be between -180 and 180."
        )


def resolve_coordinates(req: FloodPredictRequest) -> tuple[float, float]:
    latitude = req.latitude
    longitude = req.longitude

    if (
        (latitude is None or longitude is None)
        and req.coordinates
        and len(req.coordinates) >= 2
    ):
        longitude = req.coordinates[0]
        latitude = req.coordinates[1]

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=422,
            detail=(
                "latitude and longitude are required in live mode. "
                "Coordinates array may also be provided as [longitude, latitude]."
            )
        )

    latitude = float(latitude)
    longitude = float(longitude)

    validate_coordinate_pair(latitude, longitude)
    return latitude, longitude


def get_risk_level(score: int) -> str:
    if score >= 81:
        return "CRITICAL"
    if score >= 61:
        return "HIGH"
    if score >= 41:
        return "MEDIUM"
    if score >= 21:
        return "MODERATE"
    return "LOW"


def get_impact(
    value: float,
    medium_threshold: float,
    high_threshold: float
) -> str:
    if value >= high_threshold:
        return "HIGH"
    if value >= medium_threshold:
        return "MEDIUM"
    return "LOW"


def risk_status_text(risk_level: str) -> str:
    mapping = {
        "LOW": "Normal awareness recommended.",
        "MODERATE": "Monitor local conditions and official alerts.",
        "MEDIUM": "Prepare emergency supplies and review evacuation options.",
        "HIGH": "Prepare to evacuate and avoid low-lying roads.",
        "CRITICAL": "Follow official evacuation instructions immediately."
    }
    return mapping.get(risk_level, "Follow official disaster-management instructions.")


# ============================================================
# WEATHER PROVIDER: OPEN-METEO
# ============================================================

async def fetch_weather_features(
    latitude: float,
    longitude: float
) -> Dict[str, Any]:
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "rain,"
            "weather_code,"
            "wind_speed_10m"
        ),
        "hourly": (
            "precipitation,"
            "rain,"
            "precipitation_probability,"
            "relative_humidity_2m,"
            "temperature_2m,"
            "wind_speed_10m"
        ),
        "forecast_days": 2,
        "timezone": "Asia/Kolkata"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            OPEN_METEO_FORECAST_URL,
            params=params
        )
        response.raise_for_status()
        data = response.json()

    current = data.get("current", {})
    hourly = data.get("hourly", {})

    precipitation = hourly.get("precipitation", [])
    humidity_values = hourly.get("relative_humidity_2m", [])
    temperature_values = hourly.get("temperature_2m", [])
    wind_values = hourly.get("wind_speed_10m", [])
    probability_values = hourly.get("precipitation_probability", [])

    def safe_sum(values: List[Any], count: int) -> float:
        return round(
            sum(float(value or 0) for value in values[:count]),
            2
        )

    rainfall_now_mm = float(
        current.get("rain")
        or current.get("precipitation")
        or 0.0
    )

    rainfall_next_6h_mm = safe_sum(precipitation, 6)
    rainfall_next_12h_mm = safe_sum(precipitation, 12)
    rainfall_next_24h_mm = safe_sum(precipitation, 24)

    current_humidity = float(
        current.get("relative_humidity_2m")
        or (humidity_values[0] if humidity_values else 50.0)
    )

    current_temperature = (
        current.get("temperature_2m")
        if current.get("temperature_2m") is not None
        else (temperature_values[0] if temperature_values else None)
    )

    current_wind_speed = (
        current.get("wind_speed_10m")
        if current.get("wind_speed_10m") is not None
        else (wind_values[0] if wind_values else None)
    )

    max_precipitation_probability_24h = max(
        [float(value or 0) for value in probability_values[:24]] or [0]
    )

    return {
        "latitude": latitude,
        "longitude": longitude,
        "rainfallNowMm": rainfall_now_mm,
        "rainfallNext6hMm": rainfall_next_6h_mm,
        "rainfallNext12hMm": rainfall_next_12h_mm,
        "rainfallNext24hMm": rainfall_next_24h_mm,
        "precipitationProbabilityMax24h": max_precipitation_probability_24h,
        "humidityPercent": current_humidity,
        "temperatureC": current_temperature,
        "windSpeedKmh": current_wind_speed,
        "weatherCode": current.get("weather_code"),
        "provider": "Open-Meteo",
        "isLiveWeather": True,
        "updatedAt": now_utc()
    }


# ============================================================
# BASELINE FLOOD RISK ESTIMATION
# ============================================================

def calculate_baseline_flood_risk(
    weather: Dict[str, Any],
    latitude: float,
    longitude: float,
    soil_saturation_override: Optional[float] = None
) -> Dict[str, Any]:
    rain_now = float(weather.get("rainfallNowMm", 0))
    rain_6h = float(weather.get("rainfallNext6hMm", 0))
    rain_12h = float(weather.get("rainfallNext12hMm", 0))
    rain_24h = float(weather.get("rainfallNext24hMm", 0))
    humidity = float(weather.get("humidityPercent", 50))
    precipitation_probability = float(
        weather.get("precipitationProbabilityMax24h", 0)
    )

    if soil_saturation_override is not None:
        soil_saturation = float(soil_saturation_override)
        soil_saturation_source = "provided_external_data"
    else:
        soil_saturation = min(
            95.0,
            max(
                10.0,
                15.0
                + (rain_24h * 0.65)
                + ((humidity - 50.0) * 0.35)
            )
        )
        soil_saturation_source = "weather_based_proxy"

    # Weather contribution, range 0–38
    rainfall_score = min(
        38.0,
        (rain_now * 1.5)
        + (rain_6h * 0.80)
        + (rain_12h * 0.30)
        + (rain_24h * 0.12)
    )

    # Soil saturation contribution, range 0–20
    soil_score = min(
        20.0,
        soil_saturation * 0.20
    )

    # Humidity contribution, range 0–8
    humidity_score = min(
        8.0,
        max(0.0, (humidity - 60.0) * 0.20)
    )

    # Rain-probability contribution, range 0–7
    probability_score = min(
        7.0,
        precipitation_probability * 0.07
    )

    # Geographic variance for demo/prototype
    location_variation = (
        abs(math.sin(math.radians(latitude * 13.0)))
        + abs(math.cos(math.radians(longitude * 9.0)))
    ) * 3.5

    # Baseline contribution
    base_score = 4.0

    final_score = round(
        max(
            0.0,
            min(
                100.0,
                base_score
                + rainfall_score
                + soil_score
                + humidity_score
                + probability_score
                + location_variation
            )
        )
    )

    return {
        "riskScore": final_score,
        "soilSaturationPct": round(soil_saturation, 1),
        "soilSaturationSource": soil_saturation_source,
        "components": {
            "baseScore": round(base_score, 2),
            "rainfallScore": round(rainfall_score, 2),
            "soilScore": round(soil_score, 2),
            "humidityScore": round(humidity_score, 2),
            "probabilityScore": round(probability_score, 2),
            "locationVariationScore": round(location_variation, 2)
        }
    }


def create_forecast_from_weather(
    current_score: int,
    weather: Dict[str, Any]
) -> Dict[str, Dict[str, Any]]:
    rain_6h = float(weather.get("rainfallNext6hMm", 0))
    rain_12h = float(weather.get("rainfallNext12hMm", 0))
    rain_24h = float(weather.get("rainfallNext24hMm", 0))

    score_6h = min(
        100,
        max(0, round(current_score + (rain_6h * 0.35)))
    )

    score_12h = min(
        100,
        max(0, round(current_score + (rain_12h * 0.25)))
    )

    score_24h = min(
        100,
        max(0, round(current_score + (rain_24h * 0.12) - 2))
    )

    return {
        "current": {
            "score": current_score,
            "level": get_risk_level(current_score)
        },
        "6h": {
            "score": score_6h,
            "level": get_risk_level(score_6h)
        },
        "12h": {
            "score": score_12h,
            "level": get_risk_level(score_12h)
        },
        "24h": {
            "score": score_24h,
            "level": get_risk_level(score_24h)
        }
    }


# ============================================================
# ROUTING HELPERS: OPENROUTESERVICE
# ============================================================

def resolve_route_point(point: Dict[str, Any], name: str) -> tuple[float, float]:
    latitude = point.get("latitude", point.get("lat"))
    longitude = point.get("longitude", point.get("lng"))

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=422,
            detail=f"{name} must include latitude and longitude."
        )

    latitude = float(latitude)
    longitude = float(longitude)

    validate_coordinate_pair(latitude, longitude)
    return latitude, longitude


# ============================================================
# ROOT / HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Jal Rakshak AI Engine",
        "version": "2.0.0",
        "endpoints": [
            "/health",
            "/predict/flood",
            "/predict/forecast",
            "/emergency/priority",
            "/gis/safe-route",
            "/vision/analyze"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "jal-rakshak-ai",
        "version": "2.0.0",
        "time": now_utc(),
        "routingConfigured": bool(OPENROUTESERVICE_API_KEY)
    }


# ============================================================
# FLOOD PREDICTION
# ============================================================

@app.post("/predict/flood")
async def predict_flood(req: FloodPredictRequest):
    if req.simulationMode:
        return {
            "location": {
                "name": req.locationName or "Mahanadi Basin (Simulation)",
                "latitude": req.latitude,
                "longitude": req.longitude
            },
            "riskScore": 88,
            "riskLevel": "CRITICAL",
            "predictedInundationDepth": "1.45 meters",
            "rainfallForecastMm": 45.2,
            "soilSaturationPct": 92.0,
            "damDischargeRateCusecs": "11.45 Lakh",
            "factors": [
                {
                    "name": "Upstream Inflow (Hirakud Reservoir Simulation)",
                    "value": "Heavy (+14%)",
                    "impact": "HIGH"
                },
                {
                    "name": "Catchment Saturation",
                    "value": "92% Saturated",
                    "impact": "HIGH"
                },
                {
                    "name": "High Tide Backflow Surge",
                    "value": "+0.8m Backwater",
                    "impact": "MEDIUM"
                },
                {
                    "name": "Drainage Channel Siltation",
                    "value": "45% Choked",
                    "impact": "MEDIUM"
                }
            ],
            "forecast": {
                "current": {"score": 88, "level": "CRITICAL"},
                "6h": {"score": 92, "level": "CRITICAL"},
                "12h": {"score": 95, "level": "CRITICAL"},
                "24h": {"score": 84, "level": "CRITICAL"}
            },
            "modelVersion": "JalRakshak-Simulation-v1",
            "confidence": None,
            "source": "simulation",
            "isSimulation": True,
            "isEstimate": True,
            "dataStatus": "SIMULATED",
            "lastUpdated": now_utc(),
            "disclaimer": (
                "Simulation data for project demonstration only. "
                "It is not an official flood warning."
            )
        }

    latitude, longitude = resolve_coordinates(req)

    location_name = (
        req.locationName
        or req.location
        or "Current location"
    )

    try:
        weather = await fetch_weather_features(
            latitude,
            longitude
        )
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Weather provider is temporarily unavailable ({str(error)}). "
                "Unable to create a location-based risk estimate."
            )
        )

    baseline = calculate_baseline_flood_risk(
        weather=weather,
        latitude=latitude,
        longitude=longitude,
        soil_saturation_override=req.soilSaturationPct
    )

    risk_score = baseline["riskScore"]
    risk_level = get_risk_level(risk_score)

    forecast = create_forecast_from_weather(
        current_score=risk_score,
        weather=weather
    )

    predicted_depth_m = round(
        max(
            0.0,
            min(
                2.0,
                (risk_score / 100.0) * 1.25
            )
        ),
        2
    )

    return {
        "location": {
            "name": location_name,
            "latitude": latitude,
            "longitude": longitude
        },
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "predictedInundationDepth": f"{predicted_depth_m} meters",
        "rainfallForecastMm": weather["rainfallNext24hMm"],
        "soilSaturationPct": baseline["soilSaturationPct"],
        "factors": [
            {
                "name": "Current Rainfall",
                "value": f"{weather['rainfallNowMm']} mm",
                "impact": get_impact(weather["rainfallNowMm"], 5, 20)
            },
            {
                "name": "Forecast Rainfall — Next 6 Hours",
                "value": f"{weather['rainfallNext6hMm']} mm",
                "impact": get_impact(weather["rainfallNext6hMm"], 15, 40)
            },
            {
                "name": "Forecast Rainfall — Next 24 Hours",
                "value": f"{weather['rainfallNext24hMm']} mm",
                "impact": get_impact(weather["rainfallNext24hMm"], 35, 80)
            },
            {
                "name": "Humidity",
                "value": f"{weather['humidityPercent']}%",
                "impact": get_impact(weather["humidityPercent"], 70, 85)
            },
            {
                "name": "Soil Saturation Proxy",
                "value": f"{baseline['soilSaturationPct']}% ({baseline['soilSaturationSource']})",
                "impact": get_impact(baseline["soilSaturationPct"], 45, 70)
            }
        ],
        "forecast": forecast,
        "weather": weather,
        "modelComponents": baseline["components"],
        "modelVersion": "JalRakshak-BaselineRisk-v0.1",
        "confidence": None,
        "source": "weather_based_heuristic",
        "isSimulation": False,
        "isEstimate": True,
        "dataStatus": "ESTIMATED",
        "lastUpdated": now_utc(),
        "advisory": risk_status_text(risk_level),
        "disclaimer": (
            "This is a weather-based baseline flood-risk estimate, not an "
            "official flood warning or calibrated hydrological model. "
            "Always follow IMD, CWC, state, district, and local authority instructions."
        )
    }


# ============================================================
# FORECAST
# ============================================================

@app.get("/predict/forecast")
async def get_forecast(
    latitude: Optional[float] = Query(default=None),
    longitude: Optional[float] = Query(default=None),
    hours: int = 24,
    simulationMode: bool = False
):
    if simulationMode:
        return {
            "success": True,
            "source": "simulation",
            "isSimulation": True,
            "isEstimate": True,
            "data": [
                {"time": "Now", "timeLabel": "Current", "rainMm": 42, "riskScore": 88, "status": "CRITICAL"},
                {"time": "+3h", "timeLabel": "Peak simulation", "rainMm": 65, "riskScore": 94, "status": "CRITICAL"},
                {"time": "+6h", "timeLabel": "Forecast peak", "rainMm": 80, "riskScore": 98, "status": "CRITICAL"},
                {"time": "+12h", "timeLabel": "After peak", "rainMm": 35, "riskScore": 82, "status": "CRITICAL"},
                {"time": "+24h", "timeLabel": "Recovery", "rainMm": 8, "riskScore": 48, "status": "MEDIUM"}
            ],
            "disclaimer": "Simulation timeline for demonstration only."
        }

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=422,
            detail="latitude and longitude are required in live mode."
        )

    validate_coordinate_pair(latitude, longitude)
    hours = min(max(hours, 6), 48)

    prediction = await predict_flood(
        FloodPredictRequest(
            latitude=latitude,
            longitude=longitude,
            locationName="Current location",
            simulationMode=False
        )
    )

    weather = prediction["weather"]
    forecast = prediction["forecast"]

    return {
        "success": True,
        "source": prediction["source"],
        "isSimulation": False,
        "isEstimate": True,
        "location": prediction["location"],
        "data": [
            {
                "time": "Now",
                "timeLabel": "Current",
                "rainMm": weather["rainfallNowMm"],
                "riskScore": forecast["current"]["score"],
                "status": forecast["current"]["level"]
            },
            {
                "time": "+6h",
                "timeLabel": "Next 6 Hours",
                "rainMm": weather["rainfallNext6hMm"],
                "riskScore": forecast["6h"]["score"],
                "status": forecast["6h"]["level"]
            },
            {
                "time": "+12h",
                "timeLabel": "Next 12 Hours",
                "rainMm": weather["rainfallNext12hMm"],
                "riskScore": forecast["12h"]["score"],
                "status": forecast["12h"]["level"]
            },
            {
                "time": "+24h",
                "timeLabel": "Next 24 Hours",
                "rainMm": weather["rainfallNext24hMm"],
                "riskScore": forecast["24h"]["score"],
                "status": forecast["24h"]["level"]
            }
        ],
        "disclaimer": prediction["disclaimer"],
        "lastUpdated": now_utc()
    }


# ============================================================
# EMERGENCY PRIORITY
# ============================================================

@app.post("/emergency/priority")
def calculate_priority(req: PriorityRequest):
    score = 10.0
    victims = req.victims or {}

    infants = max(0, victims.get("infants", 0))
    pregnant = max(0, victims.get("pregnant", 0))
    elderly = max(0, victims.get("elderly", 0))
    children = max(0, victims.get("children", 0))
    disability = max(0, victims.get("disability", 0))
    people = max(1, req.totalPeople)

    if infants > 0:
        score += min(15, infants * 8)
    if pregnant > 0:
        score += min(15, pregnant * 10)
    if elderly > 0:
        score += min(12, elderly * 5)
    if children > 0:
        score += min(10, children * 3)
    if disability > 0:
        score += min(10, disability * 5)
    if people > 5:
        score += min(10, (people - 5) * 2)

    if req.medicalEmergency:
        score += 25

    water_severity = (req.waterSeverity or "MEDIUM").upper()
    water_depth = (req.waterDepth or "").lower()

    if (
        water_severity in ["SEVERE", "CRITICAL"]
        or "first floor" in water_depth
        or "rooftop" in water_depth
    ):
        score += 25
    elif water_severity == "HIGH" or "waist" in water_depth:
        score += 18
    elif water_severity == "MEDIUM":
        score += 10
    else:
        score += 4

    road_access = (req.roadAccess or "UNKNOWN").upper()
    if road_access in ["BLOCKED", "CUT_OFF"]:
        score += 15
    elif road_access == "PARTIALLY_BLOCKED":
        score += 8

    if req.locationRiskScore is not None:
        score += min(10, max(0, req.locationRiskScore) * 0.10)

    final_score = min(100, max(0, round(score)))

    if final_score >= 81:
        priority_level = "CRITICAL"
    elif final_score >= 61:
        priority_level = "HIGH"
    elif final_score >= 31:
        priority_level = "MEDIUM"
    else:
        priority_level = "LOW"

    return {
        "success": True,
        "priorityScore": final_score,
        "priorityLevel": priority_level,
        "isDecisionSupportOnly": True,
        "disclaimer": (
            "Priority scoring assists human emergency dispatch decisions. "
            "Authorized personnel must review and may override it."
        ),
        "timestamp": now_utc()
    }


# ============================================================
# SAFE ROUTE / GIS
# ============================================================

@app.post("/gis/safe-route")
async def get_safe_route(req: SafeRouteRequest):
    if req.simulationMode:
        return {
            "success": True,
            "source": "simulation",
            "isSimulation": True,
            "data": {
                "routeId": "sim-route-1",
                "recommended": True,
                "distanceKm": 4.2,
                "estimatedTimeMinutes": 18,
                "riskScore": 25,
                "riskLevel": "LOW",
                "status": "SIMULATION_ROUTE",
                "turnByTurn": [
                    {"step": 1, "instruction": "Proceed north on High Ground Ring Road", "distanceMeters": 1200, "safe": True},
                    {"step": 2, "instruction": "Cross elevated bypass bridge", "distanceMeters": 1800, "safe": True},
                    {"step": 3, "instruction": "Arrive at Designated Safe Evacuation Shelter", "distanceMeters": 1200, "safe": True}
                ],
                "warnings": ["Simulated demo route."]
            },
            "disclaimer": "Route geometry is simulated for demonstration only."
        }

    origin_lat, origin_lng = resolve_route_point(req.origin, "origin")
    dest_lat, dest_lng = resolve_route_point(req.destination, "destination")

    if not OPENROUTESERVICE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Safe route service is not configured. Set OPENROUTESERVICE_API_KEY in ai-service environment."
        )

    payload: Dict[str, Any] = {
        "coordinates": [
            [origin_lng, origin_lat],
            [dest_lng, dest_lat]
        ],
        "instructions": True,
        "preference": "recommended"
    }

    if req.avoidPolygon:
        payload["options"] = {
            "avoid_polygons": req.avoidPolygon
        }

    headers = {
        "Authorization": OPENROUTESERVICE_API_KEY,
        "Content-Type": "application/json"
    }

    endpoint = f"{OPENROUTESERVICE_BASE_URL}/v2/directions/{req.mode}/geojson"

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            ors_data = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Routing provider is temporarily unavailable ({str(e)})."
        )

    features = ors_data.get("features", [])
    if not features:
        raise HTTPException(
            status_code=404,
            detail="No route found between the specified origin and destination."
        )

    feature = features[0]
    properties = feature.get("properties", {})
    summary = properties.get("summary", {})
    segments = properties.get("segments", [])

    steps = []
    step_num = 1
    for seg in segments:
        for st in seg.get("steps", []):
            steps.append({
                "step": step_num,
                "instruction": st.get("instruction", "Proceed"),
                "distanceMeters": round(float(st.get("distance", 0))),
                "durationSeconds": round(float(st.get("duration", 0))),
                "roadName": st.get("name") or "Road"
            })
            step_num += 1

    distance_km = round(float(summary.get("distance", 0)) / 1000, 2)
    duration_min = max(1, math.ceil(float(summary.get("duration", 0)) / 60))

    return {
        "success": True,
        "source": "OpenRouteService",
        "isSimulation": False,
        "data": {
            "routeId": "ors-route-1",
            "recommended": True,
            "distanceKm": distance_km,
            "estimatedTimeMinutes": duration_min,
            "riskScore": None,
            "riskLevel": "UNKNOWN",
            "status": "ROUTE_GEOMETRY_ONLY",
            "geometry": feature.get("geometry"),
            "turnByTurn": steps,
            "warnings": []
        },
        "disclaimer": "Route geometry is based on available road data. Conditions can change rapidly. Follow official emergency instructions."
    }


# ============================================================
# VISION / IMAGE ANALYSIS
# ============================================================

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

@app.post("/vision/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported media type. Acceptable formats: JPEG, JPG, PNG, WEBP."
        )

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds 5MB limit."
        )

    return {
        "success": True,
        "floodDetected": None,
        "confidence": None,
        "detectedWaterDepthMeters": None,
        "depthCategory": "MODEL_NOT_CONFIGURED",
        "hazardObjectsDetected": [],
        "roadCondition": "UNKNOWN",
        "recommendedPriority": "REQUIRES_HUMAN_REVIEW",
        "suggestedEvacuation": False,
        "source": "vision_model_not_configured",
        "isSimulation": False,
        "disclaimer": "No production computer-vision flood model is configured. Human review is required."
    }


# ============================================================
# ASSISTANT / CHAT (Preserved for compatibility)
# ============================================================

@app.post("/assistant/chat")
def chat(req: ChatRequest):
    return {
        "reply": "Official deployed assistant is running on its designated service.",
        "citations": ["National Disaster Management Authority (NDMA) Guidelines"],
        "suggestedActions": [],
        "nearest_shelters": [],
        "helplines": {"Emergency": "112", "NDRF": "1078"},
        "timestamp": now_utc()
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=(APP_ENV == "development")
    )
