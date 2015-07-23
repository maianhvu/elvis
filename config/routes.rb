Rails.application.routes.draw do
  # Root
  root 'pages#index'

  # PagesController routes
  get 'pages/index'
  get 'pages/about'

  # Devise routes
  devise_for :users

  #Resource
  resources :timeslots, only: [ :index, :show, :create, :update ]
end
