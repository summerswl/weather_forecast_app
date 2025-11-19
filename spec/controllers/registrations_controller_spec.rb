# spec/controllers/registrations_controller_spec.rb
require 'rails_helper'

RSpec.describe RegistrationsController, type: :controller do
  describe 'POST #create' do
    let(:valid_params) do
      {
        user: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user, logs them in, and returns success JSON' do
        expect {
          post :create, params: valid_params
        }.to change(User, :count).by(1)

        user = User.last
        expect(session[:user_id]).to eq(user.id)
        expect(response).to have_http_status(:created)

        json = response.parsed_body
        expect(json['status']).to eq('created')
        expect(json['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid parameters' do
      it 'does not create a user and returns error for blank email' do
        invalid_params = {
          user: { email: '', password: 'password123', password_confirmation: 'password123' }
        }

        expect {
          post :create, params: invalid_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content) # ← fixed
        json = response.parsed_body
        expect(json['status']).to eq('error')
        expect(json['errors']).to include("Email can't be blank")
      end

      it 'does not create a user and returns error for password mismatch' do
        invalid_params = {
          user: { email: 'test@example.com', password: 'password123', password_confirmation: 'wrong' }
        }

        expect {
          post :create, params: invalid_params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content) # ← fixed
        json = response.parsed_body
        expect(json['status']).to eq('error')
        expect(json['errors']).to include("Password confirmation doesn't match Password")
      end

      it 'does not create a user and returns error for duplicate email' do
        User.create!(email: 'duplicate@example.com', password: 'password123', password_confirmation: 'password123')

        params = {
          user: {
            email: 'duplicate@example.com',
            password: 'password123',
            password_confirmation: 'password123'
          }
        }

        expect {
          post :create, params: params
        }.not_to change(User, :count)

        expect(response).to have_http_status(:unprocessable_content) 
        json = response.parsed_body
        expect(json['errors']).to include("Email has already been taken")
      end
    end
  end
end
