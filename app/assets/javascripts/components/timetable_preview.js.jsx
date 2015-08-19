/**
 * components/timetable_preview.js.jsx
 */
$(function() {

  var daysToShow = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var helper = new Helper();

  var uniqueStringArray = function(arr) {
    var keys = {};
    arr.forEach(function(item) { keys[item] = true; });
    return Object.keys(keys);
  };

  var TimelineItem = React.createClass({
    render: function() {
      var classes = {
        'preview-list__item': true,
        'grayed-out': !this.props.colored,
      };
      classes['start-' + this.props.slot.StartTime.toString()] = true;
      classes['duration-' + (this.props.slot.EndTime - this.props.slot.StartTime).toString()] = true;
      classes = classNames(classes);
      var styles = {
        backgroundColor: '#' + colorForModule(this.props.slot.ModuleCode),
      };
      return (
        <div className={classes} style={styles}>
          {this.props.slot.LessonType}
        </div>
      );
    },
  });

  var TimelineList = React.createClass({

    render: function() {

      var items = this.props.slots.map(function(slot, index) {
        return (
          <TimelineItem key={index} slot={slot}
            colored={this.props.highlighted === null || slot.ModuleCode === this.props.highlighted}
          />
        );
      }.bind(this));

      return (
        <ul className="preview-list" style={{ height: this.props.height + 'px' }}>
          {items}
        </ul>
      );
    },
  });

  var PreviewTimeline = React.createClass({

    getInitialState: function() { return {
      timelineHeight: 0,
    } },

    componentDidMount: function() {
      this.setState({
        timelineHeight: React.findDOMNode(this.refs.timetablePreview).clientHeight,
      });
    },

    render: function() {
      return (
        <div className="timetable-preview__timeline" ref="timetablePreview">
          <div className="timetable-preview__day">{this.props.day[0]}</div>
          <TimelineList slots={this.props.slots} height={this.state.timelineHeight} highlighted={this.props.highlighted} />
        </div>
      );
    },
  });

  window.TimetablePreview = React.createClass({

    getInitialState: function() {
      return {
        timetableData: {},
        chosenSlots: {},
        highlightedModule: null,
      };
    },

    updateSelectedModules: function(moduleCode) {
      var slots;
      if (slots = this.state.timetableData[moduleCode]) {
        var chosenSlots = uniqueStringArray(
          slots.filter(function(slot, index, arr) {
            return index === 0 || slot.LessonType !== arr[index-1].LessonType;
          }).map(function(slot) { return slot.ClassNo; })
        );
        var newSlots = this.state.chosenSlots;
        newSlots[moduleCode] = chosenSlots;
        this.setState({ chosenSlots: newSlots });
      }
    },

    updateTimetableData: function(data) {
      this.setState({
        timetableData: data
      });
    },

    updateDeletedModule: function(module) {
      var slots = this.state.chosenSlots;
      delete slots[module];
      this.setState({
        chosenSlots: slots,
        highlightedModule: null,
      });
    },

    updateHighlightedModule: function(module) {
      this.setState({ highlightedModule: module });
    },

    render: function() {
      var slots = [];
      var chosenModules = Object.keys(this.state.chosenSlots);
      for (var i = 0; i < daysToShow.length; i++) {
        slots[i] = [];
        chosenModules.forEach(function(module) {
          if (!this.state.timetableData[module]) return;
          [].push.apply(slots[i], this.state.timetableData[module].filter(function(slot) {
            return daysToShow[i] === slot.DayText && this.state.chosenSlots[module].indexOf(slot.ClassNo) !== -1;
          }.bind(this)).map(function(slot) {
            slot.ModuleCode = module;
            slot.LessonType = slot.LessonType.substr(0,3).toUpperCase();
            slot.StartTime = helper.parseTime(slot.StartTime);
            slot.EndTime = helper.parseTime(slot.EndTime);
            return slot;
          }));
        }.bind(this));
      }
      var timelines = daysToShow.map(function(day, index) {
        return (<PreviewTimeline key={index} day={day} slots={slots[index]} highlighted={this.state.highlightedModule} />);
      }.bind(this));

      return (
        <div className="timetable-preview">
          {timelines}
        </div>
      );
    },
  });

});
