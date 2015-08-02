module API
  class TimeslotController < ApplicationController
    def index
      ts = Timeslot.all

      repond_to do |format|
        format.json
      end
    end

    def create
      t = Timeslot.new(timeslot_params)

      respond_to do |format|
        format.json
      end
    end

    def show
      t = Timeslot.find(params[:id])

      respond_to do |format|
        format.json
      end
    end

    def update
      t = Timeslot.find(params[:id])

      respond_to do |format|
        format.json
      end
    end

    private
      def timeslot_params
        params.require(:timeslot).permit(:lesson_type, :class_no, :weektext, :day, :start, :end, :venue)

      end

  end
end
