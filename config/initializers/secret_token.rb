# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.
Traffic::Application.config.secret_key_base = '82411c3199bb6cb6c89fb9ea1f4b78b74885cd495777476af828a4ad96d42e22adb39adf4014896883d4f05f9270958cd78c496f67ad7bb3431e0929c2b73e1b'
