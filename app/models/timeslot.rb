class Timeslot < ActiveRecord::Base
  belongs_to :user
  belongs_to :semester
end
