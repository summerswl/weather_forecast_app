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

# ← THIS IS THE ONLY PART YOU NEED TO CHANGE
RUN chmod +x bin/rails bin/rake bin/docker-entrypoint

# Precompile bootsnap cache
RUN bundle exec bootsnap precompile --gemfile app lib

EXPOSE 3000

# Use the proper Rails entrypoint (recommended)
ENTRYPOINT ["bin/docker-entrypoint"]
CMD ["rails", "server", "-b", "0.0.0.0"]