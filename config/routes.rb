Rails.application.routes.draw do
  resources :sessions, only: [:create]
  resources :registrations, only: [:create]
  # mapping to sessions
  delete :logout, to: "sessions#logout"
  get :logged_in, to: "sessions#logged_in"
  root to: "static#index"
  get 'weather', to: 'weather#show'
  # Defines the root path route ("/")  
  # root "articles#index"
end
