from fastapi import FastAPI
from utils import calculate_shelf_life
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/api/batches")
def get_batches():
    batches = [
        {
            "batch_id": "B1",
            "temperature_readings": [4, 5, 6, 4]
        },
        {
            "batch_id": "B2",
            "temperature_readings": [4, 4, 4, 4]
        }
    ]

    result = []

    for batch in batches:
        temps = batch["temperature_readings"]

        avg_temp = sum(temps) / len(temps)

        shelf_data = calculate_shelf_life(temps)

        percentage = shelf_data["percentage"]

        # Risk logic
        if percentage > 70:
            risk = "Green"
            recommendation = "Safe"
        elif percentage > 40:
            risk = "Yellow"
            recommendation = "Use Soon"
        else:
            risk = "Red"
            recommendation = "Discard"

        result.append({
            "batch_id": batch["batch_id"],
            "avg_temperature": round(avg_temp, 2),
            "remaining_shelf_life": round(shelf_data["remaining_hours"], 2),
            "percentage": round(percentage, 2),
            "risk_level": risk,
            "recommendation": recommendation,
            "temperature_readings": [round(t, 2) for t in temps]
        })

    return result
