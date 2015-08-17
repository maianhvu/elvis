//= require ../api
//= require ../cerebro
//= require ../components/module_search
//= require ../components/module_list
//= require ../components/module_preview

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

    // Register components to Cerebro
    cerebro.registerComponent('moduleSearch', moduleSearch);
    cerebro.registerComponent('moduleList', moduleList);
    cerebro.registerComponent('modulePreview', modulePreview);

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
      outgoing: 'moduleSearch',
      incoming: ['modulePreview'],
      relay: 'moduleList',
    });
    cerebro.registerSynapse('modulesData', {
      incoming: 'moduleList',
    });

    // Start querying data from API
    var api = new API();
    // TODO: Show loading

    api.retrieveModulesData(function(data) {
      cerebro.pulse('modulesData', data);
      // TODO: Hide loading
    });

  });
});
