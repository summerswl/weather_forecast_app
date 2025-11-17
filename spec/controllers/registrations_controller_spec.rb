require 'rails_helper'

RSpec.describe RegistrationsController do
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
      it 'creates user and sets session' do
        post :create, params: valid_params
        
        expect(User.count).to eq(1)
        expect(session[:user_id]).to eq(User.last.id)
        expect(response).to have_http_status(:ok)
        
        json = JSON.parse(response.body)
        expect(json['status']).to eq('created')
        expect(json['user']['email']).to eq('test@example.com')
      end
    end

    context 'with invalid parameters' do
      it 'raises exception for missing email' do
        invalid_params = { user: { email: '', password: 'password123', password_confirmation: 'password123' } }
        
        expect {
          post :create, params: invalid_params
        }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'raises exception for password mismatch' do
        invalid_params = { user: { email: 'test@example.com', password: 'password123', password_confirmation: 'different' } }
        
        expect {
          post :create, params: invalid_params
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end
  end
end
