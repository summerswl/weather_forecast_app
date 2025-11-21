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

COPY Gemfile Gemfile.lock ./

RUN gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1 | xargs)" --conservative && \
    bundle config set --local without 'production' && \
    bundle install --jobs=4 --retry=3

# ← THIS IS THE REAL FIX (Docker 1.6+ syntax)
COPY --chmod=+x . .

# Precompile bootsnap (forces new layer)
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

ENTRYPOINT ["bin/docker-entrypoint"]
CMD ["rails", "server", "-b", "0.0.0.0"]