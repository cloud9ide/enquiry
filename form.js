"use strict";

const React = require('react');
const clone = require("lodash/clone");

const transformChildren = require("./lib/transform-children");
const reduceRefs = require("./lib/reduce-refs");


class Form extends React.Component {

    static propTypes = {
        onSubmit: React.PropTypes.func,
        values: React.PropTypes.object,
        initialValues: React.PropTypes.object,
    }
    
    constructor() {
        super();
        
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.setValues(this.props.defaultValues);
    }

    isTentativelyValid() {
        var fields = reduceRefs(this.refs);

        return Object.keys(fields).reduce(function(validated, key) {
            var field = fields[key];

            if (!field.isTentativelyValid)
                return validated;

            validated[key] = field.isTentativelyValid();
            return validated;
        }, {});
    }

    validate(done) {
        var fields = reduceRefs(this.refs);
        var values = this.getValues();

        var errors = Object.keys(fields).reduce(function(errors, key) {
            if (!fields[key].validate) return errors;

            var error = fields[key].validate(values[key], values);

            if (error)
                errors[key] = error;

            return errors;
        }, {});

        if (Object.keys(errors).length == 0)
            errors = undefined;

        return done(errors, values);
    }

    setValues(values) {
        if (typeof values !== 'object' || values === null)
            return;

        var fields = reduceRefs(this.refs);

        Object.keys(fields).forEach(function(key) {
            if (!values[key])
                return;

            var field = fields[key];

            if (Array.isArray(field)) {
                field.forEach(function(child) {
                    child.setValue(values[key]);
                });
            } else {
                field.setValue(values[key]);
            }
        });
    }

    getValues() {
        var fields = reduceRefs(this.refs);

        return Object.keys(fields).reduce(function(values, key) {
            var field = fields[key];
            var value;

            if (Array.isArray(field)) {
                value = field.reduce(function(values, field) {
                    if (field.isRadio() && field.isChecked())
                        return field.getValue();

                    if (field.isChecbox() && field.isChecked())
                        values.push(field.getValue());

                    return values;
                }, []);
            } else {
                value = field.getValue();
            }

            values[key] = value;
            return values;
        }, {});
    }

    onSubmit(evt) {
        evt.preventDefault();
        this.submit();
    }

    submit() {
        this.validate(function(errors, values) {
            if (!this.props.onSubmit) return;
            this.props.onSubmit(errors, values, this);
        }.bind(this));
    }

    render() {
        var props = clone(this.props);

        delete (props.defaultValues);

        props.onSubmit = this.onSubmit;
        props.noValidate = true;

        return React.createElement("form", props, transformChildren(this.props.children, 0));
    }
}

module.exports = Form;
