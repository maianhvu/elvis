Rails.application.routes.draw do
  root 'pages#index'

  # PagesController
  get 'pages/index'
end
