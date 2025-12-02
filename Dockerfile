# syntax=docker/dockerfile:1.6
FROM public.ecr.aws/docker/library/ruby:3.2.8-slim


RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential libpq-dev libyaml-dev git curl nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /weather_forecast_app

# Gems first for caching
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v "$(tail -n 1 Gemfile.lock | tr -d ' ')" && \
    bundle config set --local without 'production' && \
    bundle install --jobs=4 --retry=3

# Copy code
COPY . .

RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]

# React build
FROM node:16-alpine AS react-build
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]

# Final stage - choose based on SERVICE_TYPE
FROM rails-build AS rails
FROM react-build AS react