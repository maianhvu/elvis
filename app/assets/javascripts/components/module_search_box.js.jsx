/**
 * components/module_search_box.js
 *
 * Author: Mai Anh Vu
 * Copyright (c) 15 Aug 2015
 *
 */
$(function() {

  // Module search box
  window.ModuleSearchBox = React.createClass({

    getDefaultProps: function() { return {
      searchBoxPlaceholder: "Module Code, Title or NUSMods URL",
    } },

    handleFormSubmit: function() {
      e.preventDefault();
      return false;
    },

    render: function() { return (
      <form className="module-search-box" onSubmit={this.handleFormSubmit}>
        <input type="text" className="search" name="search" ref="searchBox"
          placeholder={this.props.searchBoxPlaceholder} />
      </form>
    ) },
  });

});
