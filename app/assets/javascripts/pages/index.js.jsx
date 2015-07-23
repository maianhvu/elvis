$(function() {
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
        this.setState({
          commitLabel: this.props.importModulesText,
          adding: false,
        });
      } else if (!this.props.urlRegExp.test(input) && this.state.commitLabel === this.props.importModulesText) {
        this.setState({
          commitLabel: this.props.addModuleText,
          adding: true,
        });
        this.props.onInputChange(input);
      }
    },
    // render the component
    render: function() {
      var inputField, inputOptions;
      inputOptions = {
        type: "text",
        placeholder: "Module Code, Module Title or NUSMods Share Link",
        ref: "module",
        onChange: this.checkInput
      };
      if (this.props.loading) {
        inputOptions.disabled = "disabled";
        inputOptions.placeholder = "Loading...";
      }
      inputField = React.createElement('input', inputOptions);
      return (
        <form className="modules-form">
          <div className="row collapse postfix-radius">
            {/* input */}
            <div className="small-10 columns">
              {inputField}
            </div>
            {/* commit */}
            <div className="small-2 columns">
              <input type="submit" value={this.state.commitLabel} ref="commit" className="button postfix" />
            </div>
          </div>
        </form>
      );
    }
  });

  // ModulesList
  var ModulesList = React.createClass({
    render: function() {
      // map the data to the nodes to display
      var moduleNodes = this.props.data.map(function(module) {
        var colour = moduleColourHash(module.code);
        return (
          <li key={module.code}>
            <div className="module-code" style={{backgroundColor: colour}}>{module.code}</div>
            <div className="module-title">{module.title}</div>
          </li>
        );
      });
      // display the nodes
      return (
        <ul className="modules-list">
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
    // initial state
    getInitialState: function() { return {
      loading: true,
      data: [],
      filter: "",
    }; },
    // component did mount
    componentDidMount: function() {
      this.loadModulesData();
    },
    // render
    render: function() {
      // define classNames for both subcomponents
      var containerClasses = classNames('small-12', 'medium-8', 'large-6', 'medium-offset-2', 'large-offset-3', 'columns');
      // filter data
      var filteredData;
      if (this.state.filter === "") {
        filteredData = this.state.data.slice(0, this.props.searchLimit);
      } else {
        filteredData = [];
        console.log(this.state.filter);
      }
      // render the element
      return (
        <div className="modules-box">
          <div className="row"><div className={containerClasses}>
            <ModulesForm loading={this.state.loading} onInputChange={this.handleInputChange} />
          </div></div>
          <div className="row"><div className={containerClasses}>
            <ModulesList data={filteredData} />
          </div></div>
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
  });
});
