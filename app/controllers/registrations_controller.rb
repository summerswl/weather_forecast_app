# Handles user registration by creating a new user with the provided email and password.
# If the user is successfully created, sets the user ID in the session and returns a JSON response
# with the status and user details. If creation fails, returns a JSON response with a status of 500.

class RegistrationsController < ApplicationController
  def create
    user = User.create!(
      email: params['user']['email'],
      password: params['user']['password'],
      password_confirmation: params['user']['password_confirmation']
    )

    if user
      session[:user_id] = user.id
      render json: { status: :created, user: user }
    else
      render json: { status: 500 }
    end
  end
end