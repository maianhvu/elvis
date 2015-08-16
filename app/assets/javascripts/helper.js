/**
 * helper.js
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  //-------------------------------------------------------------------------------------------------
  // LOCALFORAGE HELPERS
  //-------------------------------------------------------------------------------------------------
  var ForageKey = function(key) { this.key = key; };

  var ForageSetKey = function(key) { ForageKey.call(this, key); };
  var ForageGetKey = function(key) { ForageKey.call(this, key); };

  /* ForageKey object for setting */
  ForageSetKey.prototype.to = function(value) {
    return localforage.setItem(this.key, value);
  };

  /* ForageKey object for getting */
  ForageGetKey.prototype.then = function(callback) {
    localforage.getItem(this.key, callback);
  };

  /* Define helper class */
  var ForageSetter = function() { };

  /**
   * Set for chaining
   */
  ForageSetter.et = function(key) {
    return new ForageSetKey(key);
  };

  var ForageGetter = function() { };

  ForageGetter.et = function(key) {
    return new ForageGetKey(key);
  };

  window.printValue = function(err, value) {
    console.log(value);
  };

  /* Export to Global scope */
  window.S = ForageSetter;
  window.G = ForageGetter;

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
    var parsedTime = parseInt(time.substr(0,2)) +
      parseInt(time.substr(2,2)) / 60;
    this.timeCache[time] = parsedTime;
    return parsedTime;
  }


  window.Helper = helper;

});
