class LocationsController < ApplicationController
  before_filter :authenticate_user!

  def index
    @locations = current_user.locations.all
  end

  def create
    lat = params["lat"]
    lng = params["lng"]

    @location = Location.new(lat: lat, lng: lng, user_id: current_user.id)
    if @location.save
      render status: 200
    else
      render status: 500
    end

  end

  def destroy
    @location = Location.find(params[:id])
    @location.destroy
    render status: 200
  end

end