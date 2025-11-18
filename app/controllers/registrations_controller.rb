#
# RegistrationsController
#
# Purpose:
#   Provides a JSON-only API endpoint for user registration from the React frontend.
#   Creates a new User record, performs full validation (including password confirmation
#   and email uniqueness), and — on success — automatically logs the user in by setting
#   an authenticated session cookie.
#
# Endpoint:
#   POST /registrations
#
# Security & Behaviour:
#   - CSRF protection is deliberately skipped because this is a pure JSON API
#     consumed by a separate React application (stateless token auth is not used).
#   - Strong parameters are enforced via `user_params`.
#   - Only safe attributes (`id`, `email`) are returned in the JSON payload.
#   - Uses Rails' built-in cookie-based session authentication — the same session
#     will be recognised by the `/logged_in` endpoint and protected routes.
#
# Compatibility:
#   Designed to work with the existing React components (RegistrationAuth, LoginAuth,
#   and App.checkLoginStatus). The frontend expects a top-level `status` field of
#   "created" on success, exactly as provided.
#

class RegistrationsController < ApplicationController
  skip_before_action :verify_authenticity_token, raise: false

  # POST /registrations
  def create
    user = User.new(user_params)

    if user.save
      session[:user_id] = user.id
      render json: {
        status: 'created',
        user: user.as_json(only: [:id, :email])
      }, status: :created
    else
      render json: {
        status: 'error',
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
