(function() {

    var tunk = require('tunk');
    var React = require('react');
    var Component = React.Component;

    tunk.connectionApi.addStateUpdatedListener(function (targetObject, stateName, newValue, action) {

        if (targetObject.beforeFlowIn)
            targetObject.beforeFlowIn.call(targetObject, stateName, newValue, action);

        var state = {};
        state[stateName] = newValue;
        targetObject.setState(state);

    });

    function connect(stateOptions = {}, actionOptions = {}) {

        if(typeof stateOptions === 'function') {
            stateOptions = {};
            return connect_(arguments[0]);

        }else return connect_;


        function connect_(TargetComponent) {

            if (actionOptions) {

                var actionOptions_ = {};

                for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                    if (typeof actionOptions[x] === 'string' && actionOptions[x].indexOf('.') > -1) {
                        actionOptions_[x] = actionOptions[x].split('.');
                    } else {
                        throw 'the action option should has dot between module name and action name:' + x + ':' + actionOptions[x];
                    }
                }

                tunk.connectionApi.connectActions(TargetComponent.prototype, actionOptions_);
            }

            tunk.connectionApi.setDispatchMethod(TargetComponent.prototype, 'dispatch', function (dispatch) {
                return function (name) {
                    if (typeof name !== 'string' || name.indexOf('.') === -1) throw 'the first argument should has dot between module name and action name: ' + name;
                    name = name.split('.');
                    dispatch(name[0], name[1], Array.prototype.slice.call(arguments, 1));
                };
            });


            var AgentComponent = React.createClass({

                getInitialState: function() {

                    if (stateOptions) {

                        var stateOptions_ = {};

                        for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                            if (typeof stateOptions[x] === 'string' && stateOptions[x].indexOf('.') > -1) {
                                stateOptions_[x] = stateOptions[x].split('.');
                            } else {
                                throw 'the path of state should had dot separator: ' + x + ':' + stateOptions[x];
                            }
                        }

                        return tunk.connectionApi.connectState(this, stateOptions_);
                    }

                    return {};
                },

                componentWillUnmount:function() {
                    if (stateOptions) {
                        tunk.connectionApi.disconnect(this, stateOptions);
                    }
                },

                render:function() {
                    return React.createElement(TargetComponent, Object.assign({}, this.props, this.state));
                }

            });

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





