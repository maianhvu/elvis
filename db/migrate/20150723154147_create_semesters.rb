class CreateSemesters < ActiveRecord::Migration
  def change
    create_table :semesters do |t|
      t.integer :ordinal
      t.references :acadyear, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
