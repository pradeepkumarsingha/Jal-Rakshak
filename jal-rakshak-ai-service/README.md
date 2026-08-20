# 🤖 Jal Rakshak AI Microservice (FastAPI)

AI & Machine Learning microservice for **Jal Rakshak** disaster intelligence platform.

## Features
- **HydroML Flood Prediction**: Predicts inundation risk score and danger levels from precipitation and soil saturation.
- **Hydrological Forecasting**: 24-hour predictive water level and rainfall projection.
- **Emergency Triage Priority**: 0-100 emergency priority index based on demographic vulnerability and water depth.
- **RAG Flood Safety Assistant**: Multilingual domain-specific flood advisory with NDMA and CWC guidelines.
- **Safe Evacuation Pathfinder**: Generates high-ground routes avoiding flooded lowlands.
- **Computer Vision Water Depth Analysis**: Analyzes flood depth and road conditions from images.

## Quick Start
```bash
cd jal-rakshak-ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`
