class CreateTimeslots < ActiveRecord::Migration
  def change
    create_table :timeslots do |t|
      t.string :module_code
      t.string :lesson_type
      t.string :lesson_code
      t.integer :day_code
      t.float :start_time
      t.float :end_time
      t.string :venue
      t.string :week_text
      t.references :user, index: true, foreign_key: true
      t.references :semester, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
