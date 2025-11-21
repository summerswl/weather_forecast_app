# syntax=docker/dockerfile:1.6
FROM ruby:3.2.8-slim

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

# Precompile bootsnap
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

# THIS LINE CANNOT FAIL — NO bin/rails, NO permissions, NO drama
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]