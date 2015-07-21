$(function() {
  // Check for Storage
  if (!typeof(Storage)) {
    console.log("No WebStorage engine found. Exiting...");
    return;
  }
  var searchTimer = null;
  var start, end;

  // declare helper
  var helper = function() {};

  //------------------------------------------------------------------------------------------------------------
  // HELPER METHODS
  //------------------------------------------------------------------------------------------------------------
  /**
   * Convert a time string into number of hours since day start.
   * @param timeString {String} The HHMM formatted date string
   * @return hour The number of hours since day started, parsed from timeString
   */
  helper.parseTime = function(timeString) {
    return parseInt(timeString.substr(0,2)) +
      parseInt(timeString.substr(2,2)) / 60;
  };

  /**
   * Quick helper to determine daycode from day text
   * @param dayText {String} Text representing day
   * @return dayCode
   */
  helper.dayCode = Object.freeze({
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
  });

  /**
   * WARNING: This function is not for the weak. If you have seizures history please delete this repository,
   * sell your computer, and consult your doctor.
   * Parses the long format data form server into a shorter, storage format
   * @param data {JSONArray} The data to be parsed
   * @return parsedData shortened version
   */
  helper.processTimetableData = function(data) {
    var timeslots = {};
    if (data["Timetable"]) {
      data["Timetable"].forEach(function(slot) {
        var lessonSlots = timeslots[slot["LessonType"]];
        if (!lessonSlots) {
          lessonSlots = {};
          timeslots[slot["LessonType"]] = lessonSlots;
        }
        var key = slot["LessonType"].substr(0,3).toUpperCase().concat("[").concat(slot["ClassNo"]).concat("]");
        var slotArr = lessonSlots[key];
        if (!slotArr) {
          slotArr = [];
          lessonSlots[key] = slotArr;
        }
        slotArr.push({
          weekText: slot["WeekText"],
          day: helper.dayCode[slot["DayText"]],
          start: helper.parseTime(slot["StartTime"]),
          end: helper.parseTime(slot["EndTime"]),
          venue: slot["Venue"]
        });
      });
    }
    return JSON.stringify({
      title: data["ModuleTitle"],
      timeslots: timeslots,
    });
  };

  // declare API
  var api = function() {};
  //------------------------------------------------------------------------------------------------------------
  // DECLARE API CONSTANTS
  //------------------------------------------------------------------------------------------------------------
  api.urlFor = Object.freeze({
    timetable: "http://api.nusmods.com/2015-2016/1/timetable.json",
  });

  api.keyFor = Object.freeze({
    modulesList: "ModulesList",
    apiDataPresent: "APIDataPresent",
  });
  //------------------------------------------------------------------------------------------------------------
  // API DATA HANDLERS
  //------------------------------------------------------------------------------------------------------------
  /**
   * Fetches data from the NUSMods API, then perform the callback function on the received data
   * @param callback {Function}: The function to call upon successful data query
   */
  api.fetchData = function(callback) {
    if (callback === undefined) {
      // default callback to logging the results
      callback = function(data) { console.log(data); }
    }
    // start querying
    $.getJSON(api.urlFor.timetable, callback);
  }

  /**
   * Saves the data to cache
   * @param data {JSONArray} Raw data from server
   */
  api.cacheData = function(data) {
    var moduleCodes = [];
    data.forEach(function(module) {
      var moduleCode = module['ModuleCode'];
      // push to the moduleCodes array
      moduleCodes.push(moduleCode);
      // process data and save
      var processedData = helper.processTimetableData(module);
      sessionStorage.setItem(moduleCode, processedData);
    });
    // save modules list to a separate variable
    sessionStorage.setItem(api.keyFor.modulesList, moduleCodes.join(","));
    // mark the data as saved
    sessionStorage.setItem(api.keyFor.apiDataPresent, true);
  }

  /**
   * Checks if server data is present in cache, by checking the specified key
   * @return true if data present
   * @return false if otherwise
   */
  api.hasData = function() {
    return sessionStorage.getItem(api.keyFor.apiDataPresent);
  }

  /**
   * Gets all modules present in the cache
   * @return modules The list of all modules present in the cache
   */
  api.modulesList = function() {
    if (!api.hasData()) return [];
    return sessionStorage.getItem(api.keyFor.modulesList).split(",");
  }

  /**
   * Wipes the data relevant to the server parsed data
   */
  api.wipeData = function() {
    if (!api.hasData()) return;
    // deletes all modules data
    api.modulesList().forEach(function(moduleCode) {
      sessionStorage.removeItem(moduleCode);
    });
    // deletes the modules list
    sessionStorage.removeItem(api.keyFor.modulesList);
    // deletes the api presence flag
    sessionStorage.removeItem(api.keyFor.apiDataPresent);
  }

  // export API to global scope
  window['API'] = api;
});
