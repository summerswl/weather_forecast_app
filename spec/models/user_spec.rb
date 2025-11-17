require 'rails_helper'

RSpec.describe User do
  describe 'validations' do
    it 'requires email' do
      user = User.new(password: 'password')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it 'requires unique email' do
      User.create!(email: 'test@example.com', password: 'password')
      user = User.new(email: 'test@example.com', password: 'password')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include('has already been taken')
    end
  end

  describe 'secure password' do
    it 'authenticates with correct password' do
      user = User.create!(email: 'test@example.com', password: 'password')
      expect(user.authenticate('password')).to eq(user)
    end

    it 'fails authentication with wrong password' do
      user = User.create!(email: 'test@example.com', password: 'password')
      expect(user.authenticate('wrong')).to be false
    end
  end
end
