Traffic::Application.routes.draw do

  devise_for :users

  root :to => "static_pages#home"
  
  resources :locations, only: [:new, :create, :destroy]

    match '/locations',  to: 'locations#new',            via: 'get'

  [:locations, :home].each do |action|
    match "#{action}" => "static_pages##{action}", as: "#{action}", via: "get"
  end

  resources :users do
    get "users/new"
  end

  authenticated :user do
    root :to => "static_pages#home"
  end

end
