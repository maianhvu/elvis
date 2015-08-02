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
      React.findDOMNode(this.refs.module).focus();
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
        React.findDOMNode(this.refs.module).value = "";
        this.props.setModulesListVisibility(false);
      }.bind(this), 100);
    },
    // render the component
    render: function() {
      var inputField, inputOptions;
      inputOptions = {
        type: "text",
        placeholder: "Module Code, Title or NUSMods Share Link",
        ref: "module",
        onChange: this.queueInputCheck,
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
        <form className="modules-form">
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
    // trigger the add module functionality
    addModule: function(e) {
      var match = e.dispatchMarker.match(/\$(.+)\./);
      if (!match) return;
      console.log(API.dataForModule(match[1]));
    },
    render: function() {
      // map the data to the nodes to display
      var moduleNodes, height;
      if (this.props.data.length !== 0) {
        height = this.props.data.length;
        moduleNodes = this.props.data.map(function(module) {
          var colour = moduleColourHash(module.code);
          return (
            <li key={module.code} onClick={this.addModule}>
              <div className="module-code" style={{backgroundColor: colour}}>{module.code}</div>
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
        <ul className="modules-list" style={style}>
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
        });
      }.bind(this));
    },
    // handle module input
    handleInputChange: function(input) {
      this.setState({ filter: input.trim() });
    },
    // show or hide modules list
    setModulesListVisibility: function(visible) {
      this.setState({ modulesListVisible: visible });
    },
    // initial state
    getInitialState: function() { return {
      loading: true,
      data: [],
      filter: "",
      modulesListVisible: false,
    }; },
    // component did mount
    componentDidMount: function() {
      this.loadModulesData();
    },
    // render
    render: function() {
      // filter data
      var filteredData;
      if (this.state.filter === "") {
        filteredData = this.state.data;
      } else {
        var filterRegExp = new RegExp(this.state.filter, 'i');
        var filterFunc = function(module) {
          return filterRegExp.test(module.code + ' ' + module.title);
        }
        filteredData = $.grep(this.state.data, filterFunc);
      }
      filteredData = filteredData.limit(this.props.searchLimit);
      // render the element
      return (
        <div className="modules-box">
          <ModulesForm loading={this.state.loading} onInputChange={this.handleInputChange} setModulesListVisibility={this.setModulesListVisibility} />
          <ModulesList data={filteredData} visibility={this.state.modulesListVisible} />
        </div>
      );
    }
  });

  //------------------------------------------------------------------------------------------------------------
  // INITIALIZATION SCRIPT
  //------------------------------------------------------------------------------------------------------------
  $(document).ready(function() {
    // Rendering ModulesBox
    React.render(
      <ModulesBox />,
      document.getElementById('modules-mount-point')
    );
    // Set onClick action for Action button
    $('#start-now').click(function() {
      $('.top-bar').addClass('active');
      $('.splash').slideUp(250);
    });
  });
});
