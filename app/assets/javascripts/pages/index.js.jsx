$(function() {

  var inputUpdateTimer = null;

  var parseTime = function(time) {
    var hour = Math.floor(time).toString();
    if (hour.length === 1) hour = "0" + hour;
    var minutes = ((time % 1) * 60).toString();
    if (minutes.length === 1) minutes = "0" + minutes;
    return hour + ":" + minutes;
  }

  //-------------------------------------------------------------------------------------------------
  // REACT JS COMPONENTS
  //-------------------------------------------------------------------------------------------------
  // ModulesForm
  var ModulesForm = React.createClass({
    // set initial props
    getDefaultProps: function() { return {
      addModuleText: "Add",
      importModulesText: "Import",
      urlRegExp: /^(?:http(?:s)?:\/\/)?(?:modsn.us|nusmods\.com\/timetable)\/.+$/i,
    }; },
    // set initial states
    getInitialState: function() { return {
      adding: true,
      commitLabel: "",
    }; },
    // component did mount
    componentDidMount: function() {
      this.setState({
        commitLabel: this.props.addModuleText
      });
    },
    // check input
    checkInput: function(e) {
      var input = React.findDOMNode(this.refs.module).value.trim();
      // modify value of button
      if (this.props.urlRegExp.test(input) && this.state.commitLabel === this.props.addModuleText) {
        // if the regexp for url passes, and the label is incorrect
        // sets the label
        this.setState({
          commitLabel: this.props.importModulesText,
          adding: false,
        });
        this.hideModulesList();
      } else if (!this.props.urlRegExp.test(input)) {
        // if the regexp fails, which means user adding url manually
        // check if using correct label
        if (this.state.commitLabel === this.props.importModulesText) {
          this.setState({
            commitLabel: this.props.addModuleText,
            adding: true,
          });
          this.showModulesList();
        }
        // then, in any case, filter input
        this.props.onInputChange(input);
      }
      inputUpdateTimer = null;
    },
    queueInputCheck: function() {
      if (inputUpdateTimer !== null) {
        window.clearTimeout(inputUpdateTimer);
      }
      inputUpdateTimer = window.setTimeout(this.checkInput, 200);
    },
    // toggle modules list visibility
    showModulesList: function() {
      this.props.setModulesListVisibility(true);
    },
    hideModulesList: function() {
      window.setTimeout(function() {
        this.props.setModulesListVisibility(false);
      }.bind(this), 100);
    },
    // handle submit
    handleSubmit: function(e) {
      e.preventDefault();
      this.props.commitModule();
    },
    // handle arrow keys movement
    handleKeyInput: function(e) {
      switch (e.which) {
        case 40: // Down
          this.props.setActiveModule("down");
        break;
        case 38:
          this.props.setActiveModule("up");
        break;
      }
    },
    // render the component
    render: function() {
      var inputField, inputOptions;
      inputOptions = {
        type: "text",
        placeholder: "Module Code, Title or NUSMods Share Link",
        ref: "module",
        onChange: this.queueInputCheck,
        onKeyUp: this.handleKeyInput,
        onFocus: this.showModulesList,
        onBlur: this.hideModulesList,
        className: "search-box has-postfix"
      };
      if (this.props.loading) {
        inputOptions.disabled = "disabled";
        inputOptions.placeholder = "Loading...";
      }
      inputField = React.createElement('input', inputOptions);
      return (
        <form className="modules-form" onSubmit={this.handleSubmit}>
          {/* input */}
          <div className="search-box">
            <i className="fa fa-search" />
            {inputField}
          </div>
          {/* commit */}
          <input type="submit" value={this.state.commitLabel} ref="commit" className="button postfix" />
        </form>
      );
    }
  });

  // ModulesList
  var ModulesList = React.createClass({
    getDefaultProps: function() { return {
      itemHeight: 32,
    }; },

    updateActiveElement: function(e) {
      this.props.setActiveModule(parseInt(e.currentTarget.dataset.id));
    },

    render: function() {
      // map the data to the nodes to display
      var moduleNodes, height;
      var activeId = this.props.activeItemId;
      if (this.props.data.length !== 0) {
        height = this.props.data.length;
        moduleNodes = this.props.data.map(function(module, index) {
          var colour = "#" + colorForModule(module.code);
          var classes = activeId === index ? "active" : "";
          return (
            <li key={index} onClick={this.props.commitModule}
              onMouseEnter={this.updateActiveElement}
              className={classes}
              data-id={index}>
              <div className="module-code" style={{ backgroundColor: colour }}>{module.code}</div>
              <div className="module-title">{module.title}</div>
            </li>
          );
        }.bind(this));
      } else {
        height = 1;
        moduleNodes = (<li className="empty-item">No modules found.</li>);
      }
      var style = {
        height: (height * (this.props.itemHeight + 1)).toString() + "px",
        display: this.props.visibility ? "block" : "none",
        opacity: this.props.visibility ? 1 : 0,
      };
      // display the nodes
      return (
        <ul className="modules-list" style={style} onMouseLeave={this.resetActiveId}>
          {moduleNodes}
        </ul>
      );
    }
  });

  // ModulesBox
  var ModulesBox = React.createClass({
    // set default props
    getDefaultProps: function() { return {
      searchLimit: 5,
    } },
    // load data
    loadModulesData: function() {
      // finally, set the state to the loaded data
      API.moduleIdentities(function(identities) {
        this.setState({
          loading: false,
          data: identities,
          filteredData: identities.limit(this.props.searchLimit),
          activeItemId: 0,
        });
      }.bind(this));
    },
    // handle module input
    handleInputChange: function(input) {
      // filter data
      var filter = input.trim();
      var filteredData;
      if (filter === "") {
        filteredData = this.state.data;
      } else {
        var filterRegExp = new RegExp(filter, 'i');
        var filterFunc = function(module) {
          return filterRegExp.test(module.code + ' ' + module.title);
        }
        filteredData = $.grep(this.state.data, filterFunc);
      }
      filteredData = filteredData.limit(this.props.searchLimit);
      this.setState({
        filteredData: filteredData,
        activeItemId: 0,
      });
    },
    // show or hide modules list
    setModulesListVisibility: function(visible) {
      this.setState({ modulesListVisible: visible });
    },
    // set one module in the list to be active
    setActiveModule: function(value) {
      switch (value) {
        case "up":
          if (this.state.activeItemId > 0)
            this.setState({ activeItemId: this.state.activeItemId - 1 });
          break;
        case "down":
          if (this.state.activeItemId < this.props.searchLimit - 1)
            this.setState({ activeItemId: this.state.activeItemId + 1 });
          break;
        default:
        if (value != this.state.activeItemId) {
          this.setState({ activeItemId: value });
        }
      }
    },
    // central catchment method for adding modules
    addActiveModule: function() {
      Modules.add(this.state.filteredData[this.state.activeItemId].code);
      this.props.display.updateModulesData();
      this.props.timetable.refreshTimeslots();
    },
    // initial state
    getInitialState: function() { return {
      loading: true,
      data: [],
      filteredData: [],
      modulesListVisible: false,
      activeItemId: -1,
    }; },
    // component did mount
    componentDidMount: function() {
      this.props.display.updateModulesData();
      this.loadModulesData();
    },
    // render
    render: function() {
      // render the element
      return (
        <div className="modules-box">
          <ModulesForm loading={this.state.loading}
            onInputChange={this.handleInputChange}
            setModulesListVisibility={this.setModulesListVisibility}
            setActiveModule={this.setActiveModule}
            commitModule={this.addActiveModule}
          />
          <ModulesList data={this.state.filteredData}
            visibility={this.state.modulesListVisible}
            setActiveModule={this.setActiveModule}
            commitModule={this.addActiveModule}
            activeItemId={this.state.activeItemId}
          />
        </div>
      );
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  // MODULES DISPLAY REACT COMPONENT
  //-----------------------------------------------------------------------------------------------------------
  var TimeslotChoice = React.createClass({
    handleTimeslotClick: function() {
      this.props.onTimeslotClick(this.props.id);
    },

    render: function() {
      return (<li onClick={this.handleTimeslotClick}>{this.props.value}</li>);
    }
  });

  var ModuleGroup = React.createClass({
    getInitialState: function() {
      var chosenSlotId = 0;
      var slots = Object.keys(this.props.group);
      if (this.props.group.length !== 0) {
        var chosenSlots = Modules.timeslotsForModule(this.props.moduleCode);
        var firstSlot = slots[0];
        var chosenSlot = chosenSlots.filter(function(slot) { return slot.substr(0,3) === firstSlot.substr(0,3); })[0];
        if (chosenSlot) {
          chosenSlotId = slots.indexOf(chosenSlot);
          if (chosenSlotId === -1) chosenSlotId = 0;
        }
      }

      return {
        chosenSlotId: chosenSlotId,
        listShown: false,
      };
    },

    showList: function() {
      this.setState({ listShown: true });
    },

    hideList: function() {
      this.setState({ listShown: false });
    },

    updateChosenSlot: function(index) {
      var id = parseInt(index);
      if (id !== this.state.chosenSlotId) {
        this.setState({ chosenSlotId: parseInt(index) });
      }
      this.setState({ listShown: false });
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (prevState.chosenSlotId !== this.state.chosenSlotId) {
        var slots = Object.keys(this.props.group);
        var prevSlot = slots[prevState.chosenSlotId];
        var newSlot = slots[this.state.chosenSlotId];
        Modules.replaceSlot(this.props.moduleCode, prevSlot, newSlot);
        this.props.handleSlotChange();
      }
    },

    render: function() {
      var slots = Object.keys(this.props.group);
      var choices = slots.map(function(choice, index) {
        return (
          <TimeslotChoice key={index} id={index}
            value={choice} onTimeslotClick={this.updateChosenSlot}
          />
        );
      }.bind(this));

      var classes = classNames({
        "slots-group": true,
        "active": this.state.listShown,
      });

      return (
        <div className={classes} onMouseLeave={this.hideList}>
          <div className="slots-label" onMouseEnter={this.showList}>{slots[this.state.chosenSlotId]}</div>
          <ul className="slots-list">
            {choices}
          </ul>
        </div>
      );
    }
  });

  var ModuleSlots = React.createClass({
    render: function() {

      var groupNodes = Object.keys(this.props.groups).map(function(group, index) {
        return (
          <ModuleGroup key={index}
            moduleCode={this.props.moduleCode}
            handleSlotChange={this.props.handleSlotChange}
            group={this.props.groups[group]}
          />
        );
      }.bind(this));

      return (
        <div className="module-slots">
          {groupNodes}
        </div>
      );
    }
  });


  var ModulesDisplayItem = React.createClass({

    handleRemoveClick: function() {
      this.props.handleRemoveClick(this.props.module.code);
    },

    render: function() { return (
      <li>
        <div className="module-ordinal"
          style={{ backgroundColor: '#' + colorForModule(this.props.module.code) }}>
          {this.props.index}
        </div>
        <div className="module-info">
          <div className="module-code">{this.props.module.code}</div>
          <div className="module-title">{this.props.module.title}</div>
          <ModuleSlots handleSlotChange={this.props.handleSlotChange} moduleCode={this.props.module.code} groups={this.props.module.timeslots} />
        </div>
        <div className="module-remove">
          <button className="remove-button" onClick={this.handleRemoveClick}>&times;</button>
        </div>
      </li>
    ); }
  });

  var ModulesDisplay = React.createClass({
    updateModulesData: function() {
      var modules = Modules.all();
      this.setState({
        modules: modules.map(function(module) {
          return API.dataForModule(module);
        })
      });
      this.props.timetable.refreshTimeslots();
    },

    removeModule: function(moduleCode) {
      Modules.remove(moduleCode);
      this.updateModulesData();
      this.props.timetable.refreshTimeslots();
    },

    getInitialState: function() { return {
      modules: [],
    }; },

    render: function() {
      // enumerate the list nodes
      var moduleNodes;
      if (this.state.modules.length > 0) {
        moduleNodes = this.state.modules.map(function(module, index) {
          return (
            <ModulesDisplayItem key={index} module={module}
              index={index+1} handleRemoveClick={this.removeModule}
              handleSlotChange={this.props.timetable.refreshTimeslots}
            />
          );
        }.bind(this));
      } else {
        moduleNodes = <li>Please add modules using the box on the top left.</li>;
      }
      return (
        <ul className="modules-display-list">
          {moduleNodes}
        </ul>
      );
    }
  });
  //
  //------------------------------------------------------------------------------------------------------------
  // TIMETABLE
  //------------------------------------------------------------------------------------------------------------

  var daysText = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var mthsText = ["January","February","March","April","May","June","July","August","September","October",
    "November","December"];

  var TimelineMark = React.createClass({
    handleClick: function() {
      this.props.onMarkClick(this.props.id);
    },

    render: function() {
      var dayText = daysText[this.props.date.getDay()].substr(0,3);
      var mthText = mthsText[this.props.date.getMonth()].substr(0,3);
      var classes = classNames({
        "timeline-mark": true,
        "active": this.props.active,
      });
      var daySign = "";

      if (this.props.id <= 1) {
        var days = ["Today", "Tomorrow"];
        daySign = (<span className="today-sign">{days[this.props.id]},&nbsp;</span>);
      }

      return (
        <div className={classes} onClick={this.handleClick}>
          {/* text*/}
          <div className="mark-text">
            {daySign}{dayText} {this.props.date.getDate()} {mthText}
          </div>
          <div className="mark">
          </div>
        </div>
      );
    }
  });

  var Timeline = React.createClass({
    getDefaultProps: function() { return {
      daysLimit: 7,
    }; },

    render: function() {
      var dayNodes = [];
      var dayMillis = 1000 * 60 * 60 * 24;
      var now = new Date().getTime();
      for (var i = 0; i < this.props.daysLimit; i++) {
        dayNodes.push(
          <TimelineMark key={i}
            active={i==this.props.activeMark}
            id={i}
            onMarkClick={this.props.onUpdateActiveMark}
            date={new Date(now + i * dayMillis)} />
        );
      }
      return (
        <div className={"timeline mark-" + this.props.activeMark.toString()}>
          {dayNodes}
        </div>
      );
    }
  });

  /* Timeslots */
  var AgendaItem = React.createClass({
    render: function() {
      var detailsStyle = {
        borderLeftColor: '#' + colorForModule(this.props.timeslot.module),
        backgroundColor: '#' + fadeColorForModule(this.props.timeslot.module),
      };

      return (
        <li>
          <div className="agenda-time">
            {parseTime(this.props.timeslot.start)}<br/>
            &mdash; {parseTime(this.props.timeslot.end)}
          </div>
          <div className="agenda-details" style={detailsStyle}>
            <div className="agenda-module">{this.props.timeslot.module}</div>
            <div className="agenda-type">{this.props.timeslot.lessonType}</div>
            <div className="agenda-venue">{this.props.timeslot.venue}</div>
          </div>
        </li>
      );
    }
  });

  var AgendaDisplay = React.createClass({
    render: function() {
      var agendaNodes = this.props.timeslots.map(function(timeslot, index) {
        return (<AgendaItem key={index} timeslot={timeslot} />);
      });

      if (agendaNodes.length === 0) {
        agendaNodes = (<li className="empty-item">Nothing today. Yay! :)</li>);
      }

      return (
        <div className="agenda-display">
          <div className="agenda-title">
            {this.props.title}
          </div>
          <ul className="agenda-list">
            {agendaNodes}
          </ul>
        </div>
      );
    }
  });

  var TimetableDisplay = React.createClass({
    getDefaultProps: function() { return {
      today: new Date().getDay(),
    }; },

    getInitialState: function() { return {
      activeDay: 0,
      schoolTimeslots: [],
      upcomingTimeslots: [],
    }; },

    setActiveDay: function(day) {
      this.setState({
        activeDay: parseInt(day),
      });
      this.updateTimeslots(this.dayCodeFor(day));
    },

    updateTimeslots: function(day) {
      var sts = Modules.timeslotsForDay(day);
      var uts = this.calculateUpcomingTimeslots(day);
      this.setState({
        schoolTimeslots: sts,
        upcomingTimeslots: uts,
      });
    },

    refreshTimeslots: function() {
      this.setState({
        schoolTimeslots: Modules.timeslotsForDay(this.dayCodeFor(this.state.activeDay)),
        upcomingTimeslots: this.calculateUpcomingTimeslots(),
      });
    },

    calculateUpcomingTimeslots: function(day) {
      day = day || this.dayCodeFor(this.state.activeDay);
      var viewingToday = day === new Date().getDay();
      var slots = Modules.timeslotsForDay((day + 1) % 7);
      Array.prototype.push.apply(slots, Modules.timeslotsForDay((day + 2) % 7));
      slots = slots.filter(function(slot) { return slot.lessonType === "Tutorial" }).map(function(slot) {
        slot.lessonType = "Prepare for Tutorial";
        var daysDiff = ((slot.day + 7) - day) % 7;
        var dayString = daysDiff === 1 ?
          (viewingToday ? "tomorrow" : "the next day") :
          ("in " + daysDiff.toString() + " days");
        slot.venue = "Coming " + dayString;
        return slot;
      }.bind(this));
      return slots;
    },

    dayCodeFor: function(day) {
      return (this.props.today + day) % 7;
    },

    render: function() {
      var agendaTitle;
      switch (this.state.activeDay) {
        case 0: agendaTitle = "Today"; break;
        case 1: agendaTitle = "Tomorrow"; break;
        default:
          agendaTitle = this.state.activeDay.toString() + " days from now";
      }

      return (
        <div className="timetable-box">
          <Timeline activeMark={this.state.activeDay} onUpdateActiveMark={this.setActiveDay} />
          <AgendaDisplay title={agendaTitle + " in School"} timeslots={this.state.schoolTimeslots} />
          <AgendaDisplay title={agendaTitle + " at Home"} timeslots={this.state.upcomingTimeslots} />
        </div>
      );
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // INITIALIZATION SCRIPT
  //------------------------------------------------------------------------------------------------------------
  $(document).ready(function() {
    var animDuration = 250;

    var timetable = React.render(
      <TimetableDisplay />,
      document.getElementById('timetable-mount-point')
    );

    // Rendering ModulesDisplay
    var modulesDisplay = React.render(
      <ModulesDisplay timetable={timetable} />,
      document.getElementById('modules-display-mount-point')
    );

    // Rendering ModulesBox
    React.render(
      <ModulesBox display={modulesDisplay} timetable={timetable} />,
      document.getElementById('modules-mount-point')
    );

    var setUIVisibility = function(uiVisible) {
      var elToShow, elToHide;
      if (uiVisible) {
        elToShow = $('.main-section');
        elToHide = $('.splash-section');
      } else {
        elToShow = $('.splash-section');
        elToHide = $('.main-section');
      }
      elToShow.css({ display: 'block' });
      elToShow.addClass('shown');
      elToHide.removeClass('shown');
      if (uiVisible) {
        $('.top-bar').addClass('active');
      } else {
        $('.top-bar').removeClass('active');
      }
      window.setTimeout(function() {
        elToHide.css({ display: 'none' });
      }, animDuration);
    }

    // Set onClick action for Action button
    $('#start-now').click(function() { setUIVisibility(true); });

    // If modules data present, show the modules search immediately
    setUIVisibility(Modules.dataPresent());
  });
});
