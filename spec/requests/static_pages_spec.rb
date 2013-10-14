require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the content 'Online Traffic Data'" do
      visit '/static_pages/home'
      expect(page).to have_content('Online Traffic Data')
    end
  end
end
