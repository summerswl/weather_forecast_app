#!/bin/bash
set -e
cd /opt/weather-forecast-app
docker compose pull
docker compose up -d