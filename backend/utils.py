BASE_SHELF_LIFE = 120  # hours

def calculate_shelf_life(temps: list[float]) -> dict:
    reduction = sum((t - 4) * 2 for t in temps if t > 4)
    remaining = max(BASE_SHELF_LIFE - reduction, 0)
    percentage = (remaining / BASE_SHELF_LIFE) * 100
    return {
        "remaining_hours": round(remaining, 2),
        "percentage": round(percentage, 2)
    }
