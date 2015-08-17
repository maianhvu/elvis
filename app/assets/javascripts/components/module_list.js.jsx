/**
 * components/module_box.js.jsx
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  window.ModuleList = React.createClass({

    getDefaultProps: function() { return {
      maxRows: 4,
    } },

    getInitialState: function() { return {
      data: {},
      modules: [],
      filter: null,
      activeIndex: -1,
    } },

    updateModuleSearchFilter: function(filter) {
      var f = filter.length > 0 ? new RegExp(filter, 'i') : null;
      this.setState({
        filter: f,
        activeIndex: 0,
      });
    },

    updateModulesData: function(modulesData) {
      this.setState({
        data: modulesData,
        modules: Object.keys(modulesData),
        activeIndex: 0,
      });
    },

    updateActiveModuleIndex: function(direction) {
      switch (direction) {
        case "down":
          if (this.state.activeIndex + 1 < this.props.maxRows) {
            this.setState({ activeIndex: this.state.activeIndex + 1 });
          }
          break;
        case "up":
          if (this.state.activeIndex > 0) {
            this.setState({ activeIndex: this.state.activeIndex - 1 });
          }
          break;
      }
    },

    activeModule: function() {
      var elem = React.findDOMNode(this.refs["item" + this.state.activeIndex.toString()]);
      if (elem) {
        return $(elem).find('.module-list__code').html();
      } else {
        return null;
      }
    },

    render: function() {

      var displayedData;
      if (this.state.filter) {
        displayedData = $.grep(this.state.modules, function(module) {
          return this.state.filter.test(module + " " + this.state.data[module]);
        }.bind(this)).slice(0, this.props.maxRows);
      } else {
        displayedData = this.state.modules.slice(0, this.props.maxRows);
      }

      var listItems = displayedData.map(function(code, index) {
        var classes = classNames({
          'module-list__item': true,
          'active': index === this.state.activeIndex,
        });
        return (
          <li key={index} ref={"item" + index.toString()} className={classes}>
            <span className="module-list__code">{code}</span>:
            <span className="module0list__title">{this.state.data[code]}</span>
          </li>
        );
      }.bind(this));

      return (
        <ul className="module-list">
          {listItems}
        </ul>
      );
    },

  });

});
