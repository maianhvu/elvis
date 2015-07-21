$(function() {
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
        <form className="modules-form small-12 medium-8 large-6 medium-offset-2 large-offset-3 columns">
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
  // ModulesBox
  var ModulesBox = React.createClass({
    // load data
    loadModulesData: function() {
    },
    // initial state
    getInitialState: function() { return {
      loading: true,
      data: [],
    }; },
    // render
    render: function() {
      return (
        <div className="modules-box">
          <ModulesForm loading={false} /> {/*this.state.loading} />*/}
        </div>
      );
    }
  });

  // Initialization script
  $(document).ready(function() {
    // Load API
    if (!API.hasData()) {
      API.fetchData(API.cacheData);
    }
    // Rendering ModulesBox
    React.render(
      <ModulesBox />,
      document.getElementById('modules-mount-point')
    );
  });
});
