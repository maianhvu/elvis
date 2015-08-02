Rails.application.routes.draw do
  # Root
  root 'pages#index'

  # PagesController routes
  get 'pages/index'
  get 'pages/about'

  # Devise routes
  devise_for :users

  #Resource
  namespace :api, path: '/', constraints: { subdomain: 'api' } do
    resources :timeslots, only: [ :index, :show, :update ]
  end
end
