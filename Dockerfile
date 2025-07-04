# Step 1: Use an official Python runtime as a parent image
FROM python:3.11-slim

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy only the requirements file first to leverage Docker's build cache
COPY backend/requirements.txt .

# Step 4: Install Python packages with an increased timeout
# --- THIS IS THE FIX ---
# We are adding '--timeout=1000' to give pip a much longer time (1000 seconds) to download large packages.
RUN pip install --no-cache-dir --timeout=1000 -r requirements.txt \
    && python -m spacy download en_core_web_sm

# Step 5: Copy your backend code and AI models into the container
COPY backend/ ./backend

# Step 6: Expose the port the app runs on
EXPOSE 5000

# Step 7: Define the command to run your application using a production server (gunicorn)
CMD ["gunicorn", "--workers", "1", "--threads", "8", "--timeout", "0", "--bind", "0.0.0.0:5000", "backend.api:app"]
