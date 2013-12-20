class LocationsController < ApplicationController

  def index
    @locations = Location.all
  end

  def create
    lat = params["lat"]
    lng = params["lng"]

    @location = Location.new(lat: lat, lng: lng)
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