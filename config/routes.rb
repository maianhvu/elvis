Rails.application.routes.draw do
  # Root
  root 'pages#index'

  # PagesController routes
  get 'pages/index'
  get 'pages/about'

  # Devise routes
  devise_for :users
  devise_scope :user do
    get 'register', to: 'devise/registrations#new', as: 'register'
    get 'sign-in', to: 'devise/sessions#new', as: 'sign_in'
  end

  #Resource
  namespace :api, path: '/', constraints: { subdomain: 'api' } do
    resources :timeslots, only: [ :index, :show, :update ]
  end
end
