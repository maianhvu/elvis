/**
 * components/module_search_box.js
 *
 * Author: Mai Anh Vu
 * Copyright (c) 15 Aug 2015
 *
 */
$(function() {

  var updater = null;

  // Module search box
  window.ModuleSearch = React.createClass({

    getDefaultProps: function() { return {
      searchBoxPlaceholder: "Module Code, Title or NUSMods URL",
      updateDelay: 200,
    } },

    handleFormSubmit: function(e) {
      e.preventDefault();
      this.pulseSelectedModules('activeModule()');
    },

    handleInputChange: function() {
      if (updater) { window.clearTimeout(updater); }
      updater = window.setTimeout(function() {
        // Send updated pattern to Cerebro
        this.pulseModuleSearchFilter(React.findDOMNode(this.refs.searchBox).value.trim());
        updater = null;
      }.bind(this), this.props.updateDelay);
    },

    handleKeyUp: function(e) {
      if (e.which === 38) { // up
        this.pulseActiveModuleIndex("up");
      } else if (e.which === 40) {
        this.pulseActiveModuleIndex("down");
      }
    },

    render: function() { return (
      <form className="module-search__form" onSubmit={this.handleFormSubmit}>
        <input type="text" className="module-search__input" name="search" ref="searchBox"
          placeholder={this.props.searchBoxPlaceholder}
          onChange={this.handleInputChange}
          onKeyUp={this.handleKeyUp}
          onPaste={this.handleInputChange}
        />
      </form>
    ) },
  });

});
