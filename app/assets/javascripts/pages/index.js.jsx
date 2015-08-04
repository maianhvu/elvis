$(function() {

  var inputUpdateTimer = null;

  //-------------------------------------------------------------------------------------------------
  // REACT JS COMPONENTS
  //-------------------------------------------------------------------------------------------------
  // ModulesForm
  var ModulesForm = React.createClass({
    // set initial props
    getDefaultProps: function() { return {
      addModuleText: "Add",
      importModulesText: "Import",
      urlRegExp: /^http:\/\/modsn.us\/.+$/i,
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
      } else if (!this.props.urlRegExp.test(input)) {
        // if the regexp fails, which means user adding url manually
        // check if using correct label
        if (this.state.commitLabel === this.props.importModulesText) {
          this.setState({
            commitLabel: this.props.addModuleText,
            adding: true,
          });
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
          var colour = "#" + moduleColourHash(module.code);
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
  var ModulesDisplayItem = React.createClass({

    handleRemoveClick: function() {
      this.props.handleRemoveClick(this.props.module.code);
    },

    render: function() { return (
      <li>
        <div className="module-ordinal"
          style={{ backgroundColor: '#' + moduleColourHash(this.props.module.code) }}>
          {this.props.index}
        </div>
        <div className="module-info">
          <div className="module-code">{this.props.module.code}</div>
          <div className="module-title">{this.props.module.title}</div>
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
    },

    removeModule: function(moduleCode) {
      Modules.remove(moduleCode);
      this.updateModulesData();
    },

    getInitialState: function() { return {
      modules: [],
    }; },

    render: function() {
      // enumerate the list nodes
      var moduleNodes;
      if (this.state.modules.length > 0) {
        moduleNodes = this.state.modules.map(function(module, index) {
          return <ModulesDisplayItem key={index} module={module} index={index} handleRemoveClick={this.removeModule} />;
        }.bind(this));
      } else {
        moduleNodes = <li>Please add modules using the box on the top left.</li>
      }
      return (
        <ul className="modules-display-list">
          {moduleNodes}
        </ul>
      );
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // INITIALIZATION SCRIPT
  //------------------------------------------------------------------------------------------------------------
  $(document).ready(function() {
    // Rendering ModulesDisplay
    var modulesDisplay = React.render(
      <ModulesDisplay />,
      document.getElementById('modules-display-mount-point')
    );

    // Rendering ModulesBox
    React.render(
      <ModulesBox display={modulesDisplay} />,
      document.getElementById('modules-mount-point')
    );


    var showModulesSearch = function() {
      $('.top-bar').addClass('active');
      $('.splash').slideUp(250);
    };

    // Set onClick action for Action button
    $('#start-now').click(showModulesSearch);

    // If modules data present, show the modules search immediately
    if (Modules.dataPresent()) {
      showModulesSearch();
    }
  });
});
