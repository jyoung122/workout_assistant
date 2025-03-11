import os

# Database configuration
SQLALCHEMY_DATABASE_URI = "postgresql://postgres:1845@35.193.103.85/postgres"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask settings
DEBUG = True
SECRET_KEY = os.urandom(24)