//= require ../api
//= require ../components/module_search_box

$(function() {

  var moduleSearchBox = React.render(
    <ModuleSearchBox />,
    document.getElementById('search-box')
  );

});
