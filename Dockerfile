# syntax=docker/dockerfile:1.6
FROM ruby:3.2.8-slim

# Install system packages
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential libpq-dev libyaml-dev git curl nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /weather_forecast_app

# Install gems first (best layer caching)
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v "$(grep -A 1 "BUNDLED WITH" Gemfile.lock | tail -n 1 | xargs)" --conservative && \
    bundle config set --local without 'production' && \
    bundle install --jobs=4 --retry=3

# Copy code
COPY . .

RUN rm -rf bin && \
    bundle exec rails app:update:bin

# Precompile bootsnap
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

CMD ["bin/rails", "server", "-b", "0.0.0.0"]