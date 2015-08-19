//= require ../module_colors
/**
 * components/module_preview.js.jsx
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  var MODULE_PATT = /^([A-Z]+)(\d+(?:[A-Z]+)?)$/;

  var ModulePreviewItem = React.createClass({

    handleItemClick: function() {
      this.props.handleItemClick(this.props.index);
    },

    handleMouseEnter: function(e) {
      this.props.handleMouseEnter(this.props.index);
    },

    render: function() {
      var classes = classNames({
        'module-preview__item': true,
        'active': this.props.isActiveItem,
      });
      var styles = {
        backgroundColor: '#' + colorForModule(this.props.department + this.props.code),
      };
      return (
        <li className={classes} style={styles}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.props.handleMouseLeave}
          onClick={this.handleItemClick}>
          <div className="module-preview__dept">{this.props.department}</div>
          <div className="module-preview__code">{this.props.code}</div>
        </li>
      );
    },
  });

  window.ModulePreview = React.createClass({

    getInitialState: function() { return {
      modules: [],
      activeModuleIndex: -1,
    } },

    updateSelectedModules: function(selectedMod) {
      if (!selectedMod) return;
      if (this.state.modules.indexOf(selectedMod) === -1) {
        this.setState({
          modules: this.state.modules.concat(selectedMod),
        });
      }
    },

    deleteModuleAtIndex: function(index) {
      var modules = this.state.modules;
      this.pulseDeletedModule(modules[index]);
      modules.splice(index,1);
      this.setState({
        modules: modules,
        activeModuleIndex: -1,
      });
    },

    markModuleAsActive: function(index) {
      this.pulseHighlightedModule(this.state.modules[index]);
      this.setState({ activeModuleIndex: index });
    },

    clearActive: function() {
      this.pulseHighlightedModule(null);
      this.setState({ activeModuleIndex: -1 });
    },

    render: function() {

      var previewItems;

      if (this.state.modules.length > 0) {
        previewItems = this.state.modules.map(function(mod, index) {
          var matches = mod.match(MODULE_PATT);
          var department = matches[1];
          var code = matches[2];
          return (
            <ModulePreviewItem key={index} index={index}
              department={department} code={code}
              isActiveItem={index === this.state.activeModuleIndex}
              handleItemClick={this.deleteModuleAtIndex}
              handleMouseEnter={this.markModuleAsActive}
              handleMouseLeave={this.clearActive}
            />
          );
        }.bind(this));
      } else {
        previewItems = (
          <li className="module-preview__item--empty">
            Please add or import modules.
          </li>
        );
      }

      return (
        <ul className="module-preview">
          {previewItems}
        </ul>
      );
    },

  });

});
