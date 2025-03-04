import os

# Database configuration
SQLALCHEMY_DATABASE_URI = "postgresql://jaredhawkins-young@localhost/wa"
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Flask settings
DEBUG = True
SECRET_KEY = os.urandom(24)