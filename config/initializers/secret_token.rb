# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.
 
Traffic::Application.config.secret_token = "921b00fcfabe0368d70627020f3b4c969cfd9bdc2474f4040c1ae976f687014694beb5d36dfc0c41bac8ebde96a14fceaee228d6e34d8183c5d7cc99d310d4f9"

# Will need to come back to this and make the secret token #actually# secret. 
# This not-so-secret token is just for testing/design purposes.
