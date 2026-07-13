import pymongo
from dotenv import load_dotenv
import os

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
db_name = os.getenv("MONGODB_DB_NAME", "beauty_consultant")

print(f"Connecting to MongoDB at {mongo_uri}...")
client = pymongo.MongoClient(mongo_uri)
db = client[db_name]
salons_col = db["salons"]

# Find unverified salons
unverified = list(salons_col.find({"is_verified": False}))

if not unverified:
    print("No unverified salons found in the database.")
else:
    print(f"Found {len(unverified)} unverified salon(s):")
    for s in unverified:
        print(f"- ID: {s.get('id')} | Name: {s.get('name')} | Owner: {s.get('owner_user_id')}")
    
    # Verify all of them
    res = salons_col.update_many({"is_verified": False}, {"$set": {"is_verified": True}})
    print(f"\nSuccessfully verified {res.modified_count} salon(s)!")

client.close()
