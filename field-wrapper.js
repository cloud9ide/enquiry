"use strict";

var React = require('react');

var transformChildren = require("./lib/transform-children");
var clone = require("lodash/clone");

var Fieldset = React.createClass({
    propTypes: {
        type: function(props, propName, componentName) {
            var value = props[propName];

            if (typeof value !== "string")
                return new Error("Validation failed: expected type to be a string");

            if (value == "form")
                return new Error("Validation warning: type should not be \"form\"");
        }
    },

    render: function() {
        var props = clone(this.props);

        delete (props.type);

        return React.createElement(this.props.type, props, transformChildren(this.props.children, 0));
    },
});


module.exports = Fieldset;