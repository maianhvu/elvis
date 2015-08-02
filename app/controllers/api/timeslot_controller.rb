module API
  class TimeslotController < ApplicationController
    def index
      ts = current_user.timeslots

      repond_to do |format|
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
      @timeslots = current_user.timeslots
      current_no = @timeslots.count
      update_no = timeslot_params.count

      if (current_no < update_no)
        (0..current_no - 1).each do |i|
          @timeslots[i].update_attributes(timeslot_params[i])
          @timeslots[i].save
        end
      else
        (current_no..update_no - 1).each do |i|
          @timeslots[i] = current_user.timeslots.build(timeslots_params[i])
          @timeslots[i].save
        end
      end


      respond_to do |format|
        format.json
      end
    end

    private
      def timeslot_params
        params.require(:timeslots)
      end

  end
end
