class Semester < ActiveRecord::Base
  belongs_to :acadyear
  has_many :timeslots
end
