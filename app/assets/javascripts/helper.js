/**
 * helper.js
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  //-------------------------------------------------------------------------------------------------
  // OTHER HELPER METHODS
  //-------------------------------------------------------------------------------------------------
  var helper = function() {
    /**
     * Quick helper to determine daycode from day text
     * @param dayText {String} Text representing day
     * @return dayCode
     */
    this.dayCode = Object.freeze({
      "Sunday": 0,
      "Monday": 1,
      "Tuesday": 2,
      "Wednesday": 3,
      "Thursday": 4,
      "Friday": 5,
      "Saturday": 6,
    });

    this.timeCache = {};
  };

  helper.prototype.parseTime = function(time) {
    if (this.timeCache.hasOwnProperty(time)) {
      return this.timeCache[time];
    }
    if (time.constructor === Number) return time;
    var parsedTime = parseInt(time.substr(0,2)) +
      parseInt(time.substr(2,2)) / 60;
    this.timeCache[time] = parsedTime;
    return parsedTime;
  }


  window.Helper = helper;

});
