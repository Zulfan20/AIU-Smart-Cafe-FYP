FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements_huggingface.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all model files and code
COPY app.py .
COPY recommender_mode.h5 .
COPY recommender_data.pkl .
COPY user_encoder.pkl .
COPY item_encoder.pkl .
COPY newml/ ./newml/
COPY my_category_model/ ./my_category_model/

# Expose port
EXPOSE 7860

# Set environment variables
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "2", "--timeout", "120", "app:app"]
