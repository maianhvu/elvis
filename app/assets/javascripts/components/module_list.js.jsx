/**
 * components/module_box.js.jsx
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  var ModuleListItem = React.createClass({

    getDefaultProps: function() { return {
      isActiveItem: false,
    } },

    handleItemMouseEnter: function() {
      this.props.setActiveItem(this.props.index);
    },

    handleItemClick: function() {
      this.props.handleItemClick(this.props.code);
    },

    render: function() {
      var classes = {
        'module-list__item': true,
        'active': this.props.isActiveItem, // index === this.state.activeIndex,
      };
      classes['item-' + this.props.index] = true;
      classes = classNames(classes);
      return (
        <li className={classes}
          onMouseEnter={this.handleItemMouseEnter}
          onClick={this.handleItemClick}
          >
          <span className="module-list__code">{this.props.code}</span>:
          &nbsp;
          <span className="module-list__title">{this.props.title}</span>
        </li>
      );
    },

  });

  window.ModuleList = React.createClass({

    getDefaultProps: function() { return {
      maxRows: 4,
    } },

    getInitialState: function() { return {
      data: {},
      modules: [],
      filter: null,
      activeIndex: -1,
      dataLoaded: false,
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
        dataLoaded: true,
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

    setActiveItem: function(index) {
      this.setState({
        activeIndex: index,
      });
    },

    addClickedItemToPreview: function(item) {
      this.pulseSelectedModules(item, true);
    },

    activeModule: function() {
      return $(React.findDOMNode(this.refs.moduleList)).find('.item-' + this.state.activeIndex + ' .module-list__code').html();
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

      var listItems;
      if (displayedData.length > 0) {
        listItems = displayedData.map(function(code, index) { return (
          <ModuleListItem key={index} index={index}
            isActiveItem={index===this.state.activeIndex}
            code={code}
            title={this.state.data[code]}
            setActiveItem={this.setActiveItem}
            handleItemClick={this.addClickedItemToPreview}
          />
        ); }.bind(this));
      } else { // display empty item
        var message = this.state.dataLoaded ? "No modules found." : "Retrieving modules data, please wait..";
        listItems = (
          <li className="module-list__item--empty">
            {message}
          </li>
        );
      }

      return (
        <ul className="module-list" ref="moduleList">
          {listItems}
        </ul>
      );
    },

  });

});
