class AssociateLocationsAndUsers < ActiveRecord::Migration
  def change
    add_column :locations, :user_id, :integer, references: :users
  end
end