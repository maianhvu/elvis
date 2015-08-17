/**
 * components/module_preview.js.jsx
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  var MODULE_PATT = /^([A-Z]+)(\d+(?:[A-Z]+)?)$/;

  window.ModulePreview = React.createClass({

    getInitialState: function() { return {
      modules: [],
    } },

    updateSelectedModules: function(selectedMod) {
      if (!selectedMod) return;
      if (this.state.modules.indexOf(selectedMod) === -1) {
        this.setState({
          modules: this.state.modules.concat(selectedMod),
        });
      }
    },

    render: function() {

      var previewItems = this.state.modules.map(function(mod, index) {
        var matches = mod.match(MODULE_PATT);
        var department = matches[1];
        var code = matches[2];
        return (
          <li key={index}>
            <div className="module-preview__dept">{department}</div>
            <div className="module-preview__code">{code}</div>
          </li>
        );
      }.bind(this));

      return (
        <ul className="module-preview">
          {previewItems}
        </ul>
      );
    },

  });

});
