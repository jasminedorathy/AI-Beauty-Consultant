"""
MongoDB collection for user settings
"""
from app.mongodb.client import db

settings_collection = db["user_settings"]

# Create index on user_email for fast lookups
settings_collection.create_index("user_email", unique=True)

