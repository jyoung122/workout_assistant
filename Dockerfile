# Use the official lightweight Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy all files into the container
COPY . /app

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Create a startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'export PORT=${PORT:-8080}' >> /app/start.sh && \
    echo 'echo "Starting server on port: $PORT"' >> /app/start.sh && \
    echo 'gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT backend.app:app' >> /app/start.sh && \
    chmod +x /app/start.sh

# Run the startup script
CMD ["/bin/bash", "/app/start.sh"]