(function() {

    var tunk = require('tunk');
    var React = require('react');
    var Component = React.Component;


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

                var tmp;

                for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                    if (typeof actionOptions[x] === 'string' && actionOptions[x].indexOf('.') > -1) {
                        tmp = actionOptions[x].split('.');
                        tunk.connection.action(TargetComponent.prototype, x, tmp[0], tmp[1]);
                    } else {
                        throw 'the action option should has dot between module name and action name ' + x + ':' + actionOptions[x];
                    }
                }
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
                            throw 'the path of state should had dot separator ' + x + ':' + stateOptions[x];
                        }
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

            var AgentComponent = React.createClass({
                getInitialState: function() {
                    var state = {};
                    if(stateOptions_) for(var x in stateOptions_){
                        state[x] = tunk.connection.state(this, x, stateOptions_[x])
                    }
                    return state;
                },
                componentWillUnmount:function() {
                    tunk.connection.clean(this);
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





