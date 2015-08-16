//= require helper

$(function() {

  var helper = new Helper();

  var parseData = function(data) {
    // Parse the timetable first
    var timetable = {};
    var slotsCount = 0;
    if (data.hasOwnProperty('Timetable')) {
      slotsCount = data['Timetable'].length;
      data['Timetable'].forEach(function(timeslot) {
        var lessonGroup;
        // Check lessonType existence
        if (!timetable.hasOwnProperty(timeslot['LessonType'])) {
          timetable[timeslot['LessonType']] = {};
        }
        // Ensure it exists
        lessonGroup = timetable[timeslot['LessonType']];

        // Check classno
        var classGroup;
        if (!lessonGroup.hasOwnProperty(timeslot['ClassNo'])) {
          lessonGroup[timeslot['ClassNo']] = [];
        }
        classGroup = lessonGroup[timeslot['ClassNo']];

        classGroup.push({
          day: helper.dayCode[timeslot['DayText']],
          start: helper.parseTime(timeslot['StartTime']),
          end: helper.parseTime(timeslot['EndTime']),
          venue: timeslot['Venue'],
          weekText: timeslot['WeekText'],
        });

      });
    }
    // Then return the object
    return {
      code: data['ModuleCode'],
      title: data['ModuleTitle'],
      timetable: timetable,
      slotsCount: slotsCount,
    };
  };

  /* Declare constants */
  var APIParameters = Object.freeze({
    url: "http://api.nusmods.com/2015-2016/1/timetable.json",
    keys: Object.freeze({
      modulesList: "APIModulesList",
      dataPresent: "APIDataPresent",
    }),
  });

  /* Initialize */
  var api = function() {
    this.dataPresent = false;
  };

  // Force retrieve data
  api.prototype.retrieveData = function(callback) {
    localforage.getItem(APIParameters.keys.dataPresent, function(err, presence) {
      console.log(presence);
      if (!presence) { // Get from remote API
        $.getJSON(APIParameters.url, function(data) {
          // Process the retrieved objects one by one
          var parsedData = data.map(parseData);
          var count = 0;
          parsedData.forEach(function(module, index, dataArray) {
            localforage.setItem(module.code, module, function(err, moduleData) {
              count++;
              if (count === dataArray.length) {
                localforage.setItem(APIParameters.keys.dataPresent, true, function() {
                  if (typeof callback === 'function') callback();
                });
              }
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }
    }.bind(this));
  };

  api.prototype.module = function(code, callback) {
    if (typeof callback !== 'function') return false;
    G.et(code).then(function(err, data) {
      callback(data);
    });
  };

  /* Export to Global scope */
  window.API = api;

});
