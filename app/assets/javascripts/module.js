/**
 * module.js
 * Author: Mai Anh Vu
 * (c) 2015
 */
$(function() {

  // Define the modulesHelper instance
  var modulesHelper = function() {};

  // Define constant keys to identify common objects
  modulesHelper.keyFor = Object.freeze({
    modulesList: 'ModulesList',
    modulesDataPresent: 'ModulesDataPresent',
  });

  /**
   * Get an array containing the module codes of the selected modules.
   * @return modulesList The array containing the modules added
   */
  modulesHelper.all = function() {
    if (modulesList = localStorage.getItem(modulesHelper.keyFor.modulesList)) {
      return modulesList.split(',');
    } else {
      return [];
    }
  }

  modulesHelper.added = function(moduleCode) {
    return modulesHelper.all().indexOf(moduleCode) != -1;
  }

  modulesHelper.add = function(moduleCode, callback) {
    if (!modulesHelper.added(moduleCode)) {
      var modulesList = localStorage.getItem(modulesHelper.keyFor.modulesList);
      // If modulesList does not exist or is empty
      if (!modulesList || modulesList.trim().length === 0) {
        localStorage.setItem(modulesHelper.keyFor.modulesList, moduleCode);
      } else { // If modulesList already had objects
        localStorage.setItem(modulesHelper.keyFor.modulesList, modulesList + "," + moduleCode);
      }
      // Mark data present
      if (!localStorage.getItem(modulesHelper.keyFor.modulesDataPresent)) {
        localStorage.setItem(modulesHelper.keyFor.modulesDataPresent, true);
      }
      // Default to first timeslots
      var groups = API.timeslotsForModule(moduleCode);
      var groupKeys = Object.keys(groups);
      var groupsString = groupKeys.map(function(groupKey) {
        return Object.keys(groups[groupKey])[0];
      }).join(',');
      localStorage.setItem(moduleCode, groupsString);
    }
    if (typeof callback === 'function') { callback(); }
  }

  /**
   * Remove the module from the list
   */
  modulesHelper.remove = function(moduleCode) {
    if (modulesHelper.added(moduleCode)) {
      var newList = localStorage.getItem(modulesHelper.keyFor.modulesList);
      newList = newList.replace(new RegExp(",?" + moduleCode), "");
      if (newList[0] === ",") newList = newList.slice(1);
      localStorage.setItem(modulesHelper.keyFor.modulesList, newList);
    }
  }

  /**
   * Reads the modulesDataPresent key in the localStorage
   */
  modulesHelper.dataPresent = function() {
    return localStorage.getItem(modulesHelper.keyFor.modulesDataPresent);
  }

  /**
   * Find all the timeslots for the day
   */
  modulesHelper.timeslotsForDay = function(day) {
    var timeslots = [];
    // get all timeslots first
    modulesHelper.all().forEach(function(module) {
      // get data for the current module
      var moduleTimeslots = API.dataForModule(module).timeslots;
      var lessonTypes = Object.keys(moduleTimeslots);
      var chosenSlots = modulesHelper.timeslotsForModule(module);
      // iterate through the possible lessonTypes
      lessonTypes.forEach(function(lessonType) {
        var slots = moduleTimeslots[lessonType];
        var slotCodes = Object.keys(slots).filter(function(slotCode) {
          return chosenSlots.indexOf(slotCode) !== -1;
        });
        // iterate through slot codes
        slotCodes.forEach(function(slotCode) {
          var slot = slots[slotCode];
          // iterate through the available items for the slot
          slot.forEach(function(item) {
            if (item.day === day) {
              item.module = module;
              item.slotCode = slotCode;
              item.lessonType = lessonType;
              timeslots.push(item);
            }
          });
        });
      });
    });
    // sort according to start time
    timeslots.sort(function(a, b) {
      return a.start - b.start;
    });
    return timeslots;
  }

  /**
   * Find the chosen timeslots for the module
   */
  modulesHelper.timeslotsForModule = function(module) {
    var slotsString = localStorage.getItem(module);
    if (!slotsString) return [];
    return slotsString.split(',');
  }

  /**
   * Replace slot with new one
   */
  modulesHelper.replaceSlot = function(module, oldSlot, newSlot) {
    var oldList = localStorage.getItem(module);
    if (!oldList || oldList.trim().length === 0) return;
    localStorage.setItem(module, oldList.replace(oldSlot, newSlot));
  }

  /**
   * Wipe existing module
   */
  modulesHelper.wipeModules = function() {
    if (!modulesHelper.dataPresent()) return;
    var modules = modulesHelper.all();
    // delete each modules first
    modules.forEach(function(module) {
      localStorage.removeItem(module);
    });
    // delete the modules key
    localStorage.removeItem(modulesHelper.keyFor.modulesList);
    // delete the data present key
    localStorage.removeItem(modulesHelper.keyFor.modulesDataPresent);
  }

  // export to global scope
  window['Modules'] = modulesHelper;

});
