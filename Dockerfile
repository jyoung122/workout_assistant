# Use the official lightweight Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy all files into the container
COPY . /app

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Use ENTRYPOINT and CMD to handle the PORT environment variable correctly
ENTRYPOINT ["bash", "-c"]
CMD ["PORT=${PORT:-8080} && echo \"Starting on port: $PORT\" && exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT backend.app:app"]