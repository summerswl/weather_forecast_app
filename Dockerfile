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

# Precompile bootsnap
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3001

CMD bundle exec rails server --binding 0.0.0.0 --port ${PORT:-3001}