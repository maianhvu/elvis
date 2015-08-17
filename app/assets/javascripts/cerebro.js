/**
 * cerebro.js
 *
 * Author: Mai Anh Vu
 * Copyright (c) 2015
 */
$(function() {

  var cerebro = function() {
    this.components = {};
    this.synapses = {};
  };

  String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1);
  };

  var getUpdateMethodName = function(synapse) {
    return "update" + synapse.capitalize();
  };
  var getPulseMethodName = function(synapse) {
    return "pulse" + synapse.capitalize();
  };

  cerebro.prototype.registerComponent = function(name, component) {
    this.components[name] = component;
  };

  cerebro.prototype.registerSynapse = function(synapse, components) {
    if (!this.synapses.hasOwnProperty(synapse)) {
      this.synapses[synapse] = {
        outgoing: [],
        incoming: [],
        relay: null,
      };
    }

    // Process outgoing synapses
    if (components.hasOwnProperty('outgoing')) {
      var pulseMethodName = getPulseMethodName(synapse);
      var pulseMethod = function(value) {
        this.pulse(synapse, value);
      }.bind(this);
      var outgoingComponents = components.outgoing;
      // If the components passed in is an array
      if (outgoingComponents.constructor === Array) {
        // Filter out only the components that exist
        comps = outgoingComponents.filter(function(c) {
          return this.components.hasOwnProperty(c);
        }.bind(this));
        // First, append the components to current list of synapses
        [].push.apply(this.synapses[synapse].outgoing, comps);
        // Then, add pulse functions to the components
        comps.map(function(c) {
          return this.components[c];
        }.bind(this)).forEach(function(c) {
          c[pulseMethodName] = pulseMethod;
        }.bind(this));
      } else if (this.components.hasOwnProperty(outgoingComponents)) {
        // If the component passed in is just a String
        this.synapses[synapse].outgoing.push(outgoingComponents);
        this.components[outgoingComponents][pulseMethodName] = pulseMethod;
      }
    }

    // Process outgoing synapses
    if (components.hasOwnProperty('incoming')) {
      // If the components passed in is an array
      if (components.incoming.constructor === Array) {
        [].push.apply(this.synapses[synapse].incoming, components.incoming.filter(function(c) {
          return this.components.hasOwnProperty(c);
        }.bind(this)));
      } else if (this.components.hasOwnProperty(components.incoming)) {
        // If the component passed in is a single String
        this.synapses[synapse].incoming.push(components.incoming);
      }
    }

    // Process relay if present
    if (components.hasOwnProperty('relay')) {
      this.synapses[synapse].relay = components.relay;
    }
  };

  cerebro.prototype.pulse = function(synapse, value) {
    if (!this.synapses.hasOwnProperty(synapse) || !this.synapses[synapse].hasOwnProperty('incoming') ||
        !this.synapses[synapse].incoming.constructor === Array) return;
    // Get method name by convention
    var methodName = getUpdateMethodName(synapse);
    // Check for relay
    if (this.synapses[synapse].relay && this.components.hasOwnProperty(this.synapses[synapse].relay)) {
      var relay = this.components[this.synapses[synapse].relay];
      if (value.slice(value.length - 2) === "()") { // if value is a function
        var func = value.substr(0, value.length - 2);
        value = relay[func]();
      } else {
        value = relay.state[value] || relay.props[value];
      }
    }
    // Start processing all the components
    var components = this.synapses[synapse].incoming.map(function(componentName) {
      return this.components[componentName];
    }.bind(this)).filter(function(component) {
      return component && component.hasOwnProperty(methodName) &&
        typeof component[methodName] === 'function';
    }).forEach(function(component) {
      component[methodName](value);
    });
  };

  /* Export to global scope */
  window.Cerebro = cerebro;

});
