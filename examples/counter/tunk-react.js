(function() {

    var tunk = require('tunk');
    var React = require('react');
    var Component = React.Component;

    tunk.connectionApi.addStateUpdatedListener(function (targetObject, stateName, newValue, action) {

        if (targetObject.beforeStateInject)
            targetObject.beforeStateInject.call(targetObject, stateName, newValue, action);

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
            var stateOptions_;

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

            if(stateOptions){

                var props = Object.keys(stateOptions), types;
                if(props.length) {
                    TargetComponent.propTypes = TargetComponent.propTypes || {};
                    types = React.PropTypes.oneOfType([
                        React.PropTypes.number,
                        React.PropTypes.array,
                        React.PropTypes.bool,
                        React.PropTypes.object,
                        React.PropTypes.string,
                    ]);

                    for(var i=0,l=props.length;i<l;i++){
                        TargetComponent.propTypes[props[i]] = TargetComponent.propTypes[props[i]] || types;
                    }

                    stateOptions_ = {};
                    for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                        if (typeof stateOptions[x] === 'string' && stateOptions[x].indexOf('.') > -1) {
                            stateOptions_[x] = stateOptions[x].split('.');
                        } else {
                            throw 'the path of state should had dot separator: ' + x + ':' + stateOptions[x];
                        }
                    }
                }

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
                    return stateOptions_?tunk.connectionApi.connectState(this, stateOptions_):{};
                },
                componentWillUnmount:function() {
                    if (this._stateOptions_) {
                        tunk.connectionApi.disconnect(this, this._stateOptions_);
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





