require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RailsReactAuth
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0
    Rails.application.config.generators do |g|
      g.test_framework :rspec
    end

    # Temporarily bypass database for deployment testing
    config.active_record.database_selector = nil if Rails.env.production?
    config.active_record.database_resolver = nil if Rails.env.production?


    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    config.autoload_paths << Rails.root.join('app/services')
  end
end
