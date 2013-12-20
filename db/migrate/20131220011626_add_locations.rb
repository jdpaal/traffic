class AddLocations < ActiveRecord::Migration
  def change
    create_table :locations do |t|
      t.timestamps
    end
  end
end
