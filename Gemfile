source 'https://rubygems.org'
ruby '1.9.3'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '3.2.13'


group :development do
	gem 'sqlite3', '>= 1.3.8' # Use sqlite3 as the database for Active Record
	gem 'rspec-rails', '>= 2.13.0'
	gem 'rspec'
  gem 'pry'
end

group :test do
  gem 'selenium-webdriver', '>= 0.0.1'
  gem 'capybara', '>= 0.1'
end

gem 'strong_parameters'
gem 'bootstrap-sass', '>= 2.3.1.2' # bootstrap for some easy layout to start with
gem 'faker', '>= 1.0.1' # faker for user volume tests
gem 'factory_girl_rails', '>= 4.0.0' # factorygirl for creating users in masse for user testing


# Use SCSS for stylesheets
gem 'sass-rails', '>= 3.1.7'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .js.coffee assets and views
gem 'coffee-rails', '>= 3.2.0'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails', '>= 3.0.0'

# Turbolinks makes following links in your web application faster. Read more: https://github.com/rails/turbolinks
gem 'turbolinks', '>= 1.0.0'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '>= 1.2'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# Devise for user authentication and login
gem 'devise', '>= 1.0.0'

# Use ActiveModel has_secure_password
gem 'bcrypt-ruby', '3.0.0'

# For Administrator user roles.
gem 'cancan'

# Use unicorn as the app server
# gem 'unicorn'

# Use Capistrano for deployment
# gem 'capistrano', group: :development

# Use debugger
# gem 'debugger', group: [:development, :test]

group :production do
  gem 'pg', '0.16.0'
  gem 'rails_12factor', '0.0.2'
end
