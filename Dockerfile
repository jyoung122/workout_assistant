# Use the official lightweight Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy all files into the container
COPY . /app

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Expose the default Flask port
EXPOSE 8080

# Run the application
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8080", "backend.app:app"]