class UsersController < ApplicationController
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

  private

    def params[:user]
      params.require(:user).permit(:email, :password,
                                   :password_confirmation)
    end

end