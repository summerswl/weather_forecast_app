FROM ruby:3.2.8

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

RUN mkdir /rails_react_auth
WORKDIR /rails_react_auth

ADD Gemfile /rails_react_auth/Gemfile
ADD Gemfile.lock /rails_react_auth/Gemfile.lock

RUN bundle install

ADD . /rails_react_auth