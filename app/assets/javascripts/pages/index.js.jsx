//= require ../api
//= require ../cerebro
//= require ../components/module_search
//= require ../components/module_list
//= require ../components/module_preview
//= require ../components/timetable_preview

$(function() {
  $(document).ready(function() {

    // Instantiate Cerebro
    var cerebro = new Cerebro();

    // Instantiate React Components
    var moduleSearch = React.render(
      <ModuleSearch />,
      document.getElementById('module-search')
    );

    var moduleList = React.render(
      <ModuleList />,
      document.getElementById('module-list')
    );

    var modulePreview = React.render(
      <ModulePreview />,
      document.getElementById('module-preview')
    );

    var timetablePreview = React.render(
      <TimetablePreview />,
      document.getElementById('timetable-preview')
    );

    // Register components to Cerebro
    cerebro.registerComponent('moduleSearch', moduleSearch);
    cerebro.registerComponent('moduleList', moduleList);
    cerebro.registerComponent('modulePreview', modulePreview);
    cerebro.registerComponent('timetablePreview', timetablePreview);

    // Register synapses
    cerebro.registerSynapse('moduleSearchFilter', {
      outgoing: 'moduleSearch',
      incoming: 'moduleList',
    });
    cerebro.registerSynapse('activeModuleIndex', {
      outgoing: 'moduleSearch',
      incoming: 'moduleList',
    });
    cerebro.registerSynapse('selectedModules', {
      outgoing: ['moduleSearch', 'moduleList'],
      incoming: ['modulePreview', 'timetablePreview'],
      relay: 'moduleList',
    });
    cerebro.registerSynapse('modulesData', {
      incoming: 'moduleList',
    });
    cerebro.registerSynapse('deletedModule', {
      outgoing: 'modulePreview',
      incoming: 'timetablePreview',
    });
    cerebro.registerSynapse('highlightedModule', {
      outgoing: 'modulePreview',
      incoming: 'timetablePreview',
    });

    cerebro.registerSynapse('timetableData', {
      incoming: 'timetablePreview',
    });

    // Start querying data from API
    var api = new API();

    api.retrieveModulesData(function(data) {
      cerebro.pulse('modulesData', data);
      $('.module-search__input')[0].focus();
    });

    api.retrieveTimetableData(function(data) {
      var timetableData = {};
      data.forEach(function(datum) {
        if (datum.Timetable) {
          timetableData[datum.ModuleCode] = datum.Timetable;
        }
      });
      cerebro.pulse('timetableData', timetableData);
    });

  });
});
