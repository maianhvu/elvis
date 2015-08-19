$(function() {

  window.SlotPicker = React.createClass({

    getInitialState: function() { return {
    } },

    render: function() {
      return (
        <div className="slot-picker">
          <h2 className="slot-picker__module-code">{this.state.module.ModuleCode}</h2>
          <h3 className="slot-picker__module-title">{this.state.module.ModuleTitle}</h3>

        </div>
      );
    },
  });

});
