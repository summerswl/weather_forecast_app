module CurrentUserConcern
  extend ActiveSupport::Concern

  included do
    before_action :set_current_user
  end

  def set_current_user
    if session[:user_id]
      # set current_user to find out if user is logged in
      @current_user = User.find(session[:user_id])
    end
  end
end