class FixColumn < ActiveRecord::Migration
  def change
    rename_column :timeslots, :lesson_code, :class_no
    change_column :timeslots, :class_no, :integer
  end
end
