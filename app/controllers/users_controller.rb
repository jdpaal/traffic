class UsersController < ApplicationController

  respond_to :js, :html

  #
  # CRUD
  #

  def new
  	@user = User.new
  end

  def create
    @user = User.new(params[:user])
    if @user.save
      redirect_to location_path
    else
      render 'new'
    end
  end

  def show
  end

  #
  # Custom
  #

  def locations
    user_id = params[:id]
    @user = User.find(user_id)
    @locations = @user.locations.all
  end

  private

  # TODO
  #
  # def params[:user]
  #   params.require(:user).permit(:email, :password, :password_confirmation)
  # end

end