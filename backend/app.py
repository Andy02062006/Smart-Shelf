from fastapi import FastAPI, HTTPException
from utils import calculate_shelf_life
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from db import batches_collection
import random

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data for initial seeding
def get_initial_mock_data():
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    return [
        {
            "batch_id": "B1-204",
            "temperature_readings": [3.2, 3.5, 3.1, 3.3],
            "temperature_history": [3.0, 3.2, 3.5, 3.1, 3.3],
            "location": "Cold Storage Unit A",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B2-902",
            "temperature_readings": [6.8, 7.5, 8.1, 7.9],
            "temperature_history": [4.0, 5.5, 6.8, 7.5, 8.1, 7.9],
            "location": "Transport Truck 2",
            "storage_type": "Transport",
            "last_updated": now
        },
        {
            "batch_id": "B3-112",
            "temperature_readings": [12.5, 13.2, 14.5, 15.1],
            "temperature_history": [4.0, 8.2, 12.5, 13.2, 14.5, 15.1],
            "location": "Malfunctioning Freezer 4",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B4-401",
            "temperature_readings": [4.1, 4.3, 4.0, 4.2],
            "temperature_history": [3.8, 4.1, 4.3, 4.0, 4.2],
            "location": "Cold Storage Unit B",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B5-512",
            "temperature_readings": [18.5, 19.2, 20.1, 19.8],
            "temperature_history": [15.0, 18.5, 19.2, 20.1, 19.8],
            "location": "Unrefrigerated Loading Dock",
            "storage_type": "Processing Unit",
            "last_updated": now
        },
        {
            "batch_id": "B6-881",
            "temperature_readings": [2.5, 2.8, 2.4, 2.6],
            "temperature_history": [2.2, 2.5, 2.8, 2.4, 2.6],
            "location": "Deep Freezer 2",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B7-602",
            "temperature_readings": [7.2, 7.8, 8.5, 8.2],
            "temperature_history": [4.0, 6.5, 7.2, 7.8, 8.5, 8.2],
            "location": "Shelf D-2",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B8-711",
            "temperature_readings": [6.5, 7.2, 7.8, 8.1],
            "temperature_history": [5.0, 6.5, 7.2, 7.8, 8.1],
            "location": "Cold Storage Unit A",
            "storage_type": "Cold Storage",
            "last_updated": now
        },
        {
            "batch_id": "B9-102",
            "temperature_readings": [5.5, 6.2, 6.8, 7.1],
            "temperature_history": [4.5, 5.5, 6.2, 6.8, 7.1],
            "location": "Transport Truck 1",
            "storage_type": "Transport",
            "last_updated": now
        },
        {
            "batch_id": "B10-223",
            "temperature_readings": [14.2, 15.5, 16.8, 16.1],
            "temperature_history": [10.0, 14.2, 15.5, 16.8, 16.1],
            "location": "Transport Van 3 - Cooling Fail",
            "storage_type": "Transport",
            "last_updated": now
        }
    ]

@app.on_event("startup")
async def seed_db():
    for batch in get_initial_mock_data():
        batches_collection.update_one(
            {"batch_id": batch["batch_id"]},
            {"$setOnInsert": batch},
            upsert=True
        )

def process_batch(batch):
    temps = batch["temperature_readings"]
    # Remove _id from MongoDB result
    if "_id" in batch:
        del batch["_id"]
        
    shelf_life_data = calculate_shelf_life(temps)
    batch_id = batch["batch_id"]
    hours = round(float(shelf_life_data["remaining_hours"]), 2)
    days = round(hours / 24, 2)
    
    risk_level = "Green" if shelf_life_data["percentage"] > 70 else "Yellow" if shelf_life_data["percentage"] > 40 else "Red"
    
    explanation = f"According to the stored temperature conditions, the milk is likely to last for {hours} hours (~{days} days)."
    
    usage_guidance = ""
    if risk_level == "Green":
        usage_guidance = "\n\nBased on its storage condition, the best use is:\n• Regular production use\n• Standard packaging and distribution"
    elif risk_level == "Yellow":
        usage_guidance = "\n\nBased on its storage condition, the best use is:\n• Prioritize for immediate processing\n• Use for short shelf-life products (e.g., curd, paneer)"
    else: # Red
        usage_guidance = "\n\nBased on its storage condition, the best use is:\n• Immediate processing if safe\n• Divert to low-risk products\n• Otherwise discard to avoid safety risks"

    return {
        "batch_id": batch_id,
        "avg_temperature": round(sum(temps) / len(temps), 2),
        "remaining_shelf_life": hours,
        "percentage": round(float(shelf_life_data["percentage"]), 2),
        "risk_level": risk_level,
        "temperature_history": [round(t, 2) for t in batch["temperature_history"]],
        "temperature_readings": [round(t, 2) for t in temps],
        "location": batch.get("location", "Main Hub"),
        "storage_type": batch.get("storage_type", "Standard"),
        "last_updated": datetime.now().strftime("%H:%M:%S"),
        "recommendation": "Safe" if risk_level == "Green" else "Monitor" if risk_level == "Yellow" else "Discard",
        "insight": explanation + usage_guidance
    }

@app.get("/")
def root():
    return {"message": "API is running"}

def simulate_data_updates():
    batches = list(batches_collection.find())
        
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    for batch in batches:
        # Get the latest temperature
        current_readings = batch.get("temperature_readings", [4.0])
        last_temp = current_readings[-1]
        
        # Add random drift (-0.5 to +0.5)
        drift = random.uniform(-0.5, 0.5)
        new_temp = round(max(min(last_temp + drift, 30.0), -5.0), 2)
        
        # Update readings (keep last 4)
        new_readings = (current_readings + [new_temp])[-4:]
        
        # Update history (keep last 10 for performance)
        new_history = (batch.get("temperature_history", []) + [new_temp])[-10:]
        
        # Update MongoDB
        batches_collection.update_one(
            {"batch_id": batch["batch_id"]},
            {
                "$set": {
                    "temperature_readings": [round(t, 2) for t in new_readings],
                    "temperature_history": [round(t, 2) for t in new_history],
                    "last_updated": now
                }
            }
        )

@app.get("/api/batches")
def get_all_batches():
    simulate_data_updates()
    batches = list(batches_collection.find())
    return [process_batch(b) for b in batches]

@app.get("/api/batches/{batch_id}")
def get_batch(batch_id: str):
    batch = batches_collection.find_one({"batch_id": batch_id})
        
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return process_batch(batch)
