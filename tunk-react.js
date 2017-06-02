(function() {

    var tunk = require('tunk');
    var React = require('react');
    var Component = React.Component;
    var PropTypes = require('prop-types');


    tunk.hook('updateComponentState', function(origin){
        return function(targetObject, stateName, newValue, module, action){
            if (targetObject.beforeStateInject)
                targetObject.beforeStateInject.call(targetObject, stateName, newValue, module+'.'+action);

            var state = {};
            state[stateName] = newValue;
            targetObject.setState(state);
        }
    });

    function connect(stateOptions = {}, actionOptions = {}) {

        if(typeof stateOptions === 'function') {
            stateOptions = {};
            return connect_(arguments[0]);

        }else return connect_;


        function connect_(TargetComponent) {
            var stateOptions_;

            if (actionOptions) {
            
                if(actionOptions.constructor === Array) {
                    for (var i=0, x=actionOptions[0]; i<actionOptions.length; i++, x=actionOptions[i]) {
                        var proto = tunk.connection.getModule(x).__proto__,
                            protoNames = Object.getOwnPropertyNames(proto);
                        for(var i = 0, y = protoNames[0]; i< protoNames.length; i++, y = protoNames[i]) if(proto[y].actionOptions) {
                            tunk.connection.action(TargetComponent.prototype, x + '_' + y, x, y);
                        }
                    }
                }else
                    for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                        if (typeof actionOptions[x] === 'string' )
                            if(actionOptions[x].indexOf('.') > -1) {
                                tmp = actionOptions[x].split('.');
                                tunk.connection.action(TargetComponent.prototype, x, tmp[0], tmp[1]);
                            } else {
                                var proto = tunk.connection.getModule(actionOptions[x]).__proto__,
                                    protoNames = Object.getOwnPropertyNames(proto);
                                for(var i = 0, y = protoNames[0]; i< protoNames.length; i++, y = protoNames[i]) if(proto[y].actionOptions) {
                                    tunk.connection.action(TargetComponent.prototype, x + '_' + y, actionOptions[x], y);
                                }
                            }
                    }
            }

            if(stateOptions){

                var props = Object.keys(stateOptions), types;
                if(props.length) {
                    TargetComponent.propTypes = TargetComponent.propTypes || {};
                    types = PropTypes.oneOfType([
                        PropTypes.number,
                        PropTypes.array,
                        PropTypes.bool,
                        PropTypes.object,
                        PropTypes.string,
                    ]);

                    for(var i=0,l=props.length;i<l;i++){
                        TargetComponent.propTypes[props[i]] = TargetComponent.propTypes[props[i]] || types;
                    }

                    stateOptions_ = {};

                    if(stateOptions.constructor === Array) {
                        for (var i=0; i<stateOptions.length; i++) {
                            stateOptions_[stateOptions[i]] = stateOptions[i].split('.');
                        }
                    }else
                        for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                            stateOptions_[x] = stateOptions[x].split('.');
                        }
                }

            }

            tunk.connection.dispatch(TargetComponent.prototype, 'dispatch', function(dispatch){
                return function(actionPath){
                    if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw 'the first argument should has dot between module name and action name: ' + actionPath;
                    actionPath = actionPath.split('.');
                    dispatch(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                }
            });

            function AgentComponent(props){
                Component.call(this, props);
                this.state = {};
                if(stateOptions_) for(var x in stateOptions_){
                    this.state[x] = tunk.connection.state(this, x, stateOptions_[x])
                }
            }
            AgentComponent.prototype = new Component();

            Object.assign(AgentComponent.prototype, {
                constructor: AgentComponent,
                componentWillUnmount:function() {
                    tunk.connection.clean(this);
                },
                render:function() {
                    return React.createElement(TargetComponent, Object.assign({}, this.props, this.state));
                }
            });


            // var AgentComponent = React.createClass({
            //     getInitialState: function() {
            //         var state = {};
            //         if(stateOptions_) for(var x in stateOptions_){
            //             state[x] = tunk.connection.state(this, x, stateOptions_[x])
            //         }
            //         return state;
            //     },
            //     componentWillUnmount:function() {
            //         tunk.connection.clean(this);
            //     },
            //     render:function() {
            //         return React.createElement(TargetComponent, Object.assign({}, this.props, this.state));
            //     }
            // });

            return AgentComponent;
        }
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = {connect:connect};
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return {connect:connect};
        })
    }

})();





