from pymongo import MongoClient

# MongoDB Connection Configuration
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "smart_shelf"
COLLECTION_NAME = "batches"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
batches_collection = db[COLLECTION_NAME]

def get_db():
    return db

def get_batches_collection():
    return batches_collection
