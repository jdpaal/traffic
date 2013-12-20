Traffic::Application.routes.draw do

  devise_for :users

  root :to => "static_pages#home"

  #
  # Resources
  #

  resources :locations, only: [:index, :new, :create, :destroy]

  resources :users do
    get "users/new"
  end

  authenticated :user do
    root :to => "static_pages#home"
  end

  #
  # Custom routes
  #

  # User routes
  [:locations].each do |action|
    match "/user/:id/#{action}" => "users##{action}", as: "user_#{action}"
  end

  # Static page routes
  [:locations, :home].each do |action|
    match "#{action}" => "static_pages##{action}", as: "#{action}", via: "get"
  end

end
