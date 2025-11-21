# syntax=docker/dockerfile:1.6
FROM ruby:3.2.8-slim

# Install required system packages
# - libyaml-dev    → fixes psych gem compilation
# - libpq-dev      → neededily pg gem
# - build-essential + git → general native extension building
# - nodejs          → required for Rails asset pipeline / jsbundling-rails / etc.
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      libyaml-dev \         
      git \
      curl \
      nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /weather_forecast_app

# Install bundler and gems
COPY Gemfile Gemfile.lock ./

# Use a consistent bundler version and install gems
RUN gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1 | xargs)" --conservative && \
    bundle config set --local without 'production' && \
    bundle install --jobs=4 --retry=3

# Copy the rest of the application
COPY . .

RUN chmod +x bin/docker-entrypoint

# Precompile bootsnap cache for faster boot (optional but recommended)
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]