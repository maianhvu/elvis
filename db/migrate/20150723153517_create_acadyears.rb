class CreateAcadyears < ActiveRecord::Migration
  def change
    create_table :acadyears do |t|
      t.integer :start_year
      t.integer :end_year

      t.timestamps null: false
    end
  end
end
