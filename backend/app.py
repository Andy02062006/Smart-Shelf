from fastapi import FastAPI, HTTPException
from utils import calculate_shelf_life
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data Source with Diverse Risk Examples
def get_batch_data():
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    return [
        {
            "batch_id": "B1-204",
            "temperature_readings": [4.2, 4.5, 4.1, 4.3],
            "temperature_history": [4.0, 4.2, 3.9, 4.1, 4.3, 4.2],
            "location": "Shelf A-1",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B2-902",
            "temperature_readings": [6.8, 7.5, 8.1, 7.9],
            "temperature_history": [4.0, 4.8, 5.5, 6.5, 7.2, 7.5, 8.1, 7.9],
            "location": "Loading Dock",
            "storage_type": "Transport",
            "last_updated": now
        },
        {
            "batch_id": "B3-112",
            "temperature_readings": [10.5, 11.2, 12.5, 13.1],
            "temperature_history": [4.0, 6.5, 8.2, 10.5, 11.2, 12.5, 13.1],
            "location": "Warehouse 4 (Malfunction)",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B4-401",
            "temperature_readings": [3.8, 4.0, 4.2, 4.1],
            "temperature_history": [3.5, 3.8, 4.0, 4.2, 4.1],
            "location": "Shelf B-2",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B5-512",
            "temperature_readings": [6.1, 6.5, 6.2, 6.4],
            "temperature_history": [4.0, 4.5, 5.2, 6.1, 6.5, 6.2],
            "location": "Shelf C-1",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B6-881",
            "temperature_readings": [2.5, 2.8, 2.4, 2.6],
            "temperature_history": [2.2, 2.5, 2.8, 2.4, 2.6],
            "location": "Deep Freezer 2",
            "storage_type": "Cold Storage",
            "last_updated": now
        }
    ]

def process_batch(batch):
    temps = batch["temperature_readings"]
    avg_temp = sum(temps) / len(temps)
    shelf_data = calculate_shelf_life(temps)
    percentage = shelf_data["percentage"]

    if percentage > 70:
        risk = "Green"
        recommendation = "Safe"
        insight = "Storage conditions are optimal"
    elif percentage > 40:
        risk = "Yellow"
        recommendation = "Use Soon"
        insight = "Temperature fluctuations detected, monitor closely"
    batch_id = batch["batch_id"]
    shelf_life_data = calculate_shelf_life(temps)
    
    return {
        "batch_id": batch_id,
        "avg_temperature": round(sum(temps) / len(temps), 2),
        "remaining_shelf_life": round(float(shelf_life_data["remaining_hours"]), 2),
        "percentage": round(float(shelf_life_data["percentage"]), 2),
        "risk_level": "Green" if shelf_life_data["percentage"] > 70 else "Yellow" if shelf_life_data["percentage"] > 40 else "Red",
        "temperature_history": [round(t, 2) for t in batch["temperature_history"]],
        "temperature_readings": [round(t, 2) for t in temps],
        "location": batch.get("location", "Main Hub"),
        "storage_type": batch.get("storage_type", "Standard"),
        "last_updated": datetime.now().strftime("%H:%M:%S"),
        "recommendation": "Safe" if shelf_life_data["percentage"] > 70 else "Monitor" if shelf_life_data["percentage"] > 40 else "Discard",
        "insight": f"Batch {batch_id} is showing stable performance." if shelf_life_data["percentage"] > 70 else f"Batch {batch_id} requires immediate attention."
    }

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/api/batches")
def get_all_batches():
    batches = get_batch_data()
    return [process_batch(b) for b in batches]

@app.get("/api/batches/{batch_id}")
def get_batch(batch_id: str):
    batches = get_batch_data()
    batch = next((b for b in batches if b["batch_id"] == batch_id), None)
    
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    return process_batch(batch)
