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

  // export to global scope
  window['Modules'] = modulesHelper;

});
