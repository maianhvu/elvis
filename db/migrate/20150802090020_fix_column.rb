class FixColumn < ActiveRecord::Migration
  def change
    remove_column :timeslots, :lesson_code
    add_column :timeslots, :class_no, :integer
  end
end
