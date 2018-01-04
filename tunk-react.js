(function () {

    var React = require('react');
    var Component = React.Component;
    var PropTypes = require('prop-types');
    var connections = [];

    function tunkReact(utils) {

        var tunk = this;
        utils.hook('setState', function (origin) {
            return function (newState, options) {
                var pipes = connections[options.moduleName],
                    changedFields = Object.keys(newState),
                    statePath;

                origin(newState, options);

                setTimeout(function () {
                    if (pipes && pipes.length) for (var i = 0, l = pipes.length; i < l; i++) if (pipes[i]) {
                        statePath = pipes[i].statePath;
                        // 只更新 changedFields 字段
                        if (statePath[1] && changedFields.indexOf(statePath[1]) === -1) continue;
                        //减少克隆次数，分发出去到达 View 的数据用同一个副本，减少调用
                        (function (targetObject, propName, newValue, options) {
                            if (targetObject.beforeStateInject)
                                targetObject.beforeStateInject.call(targetObject, propName, newValue, module + '.' + action);
                            var state = {};
                            state[propName] = newValue;
                            targetObject.setState(state);
                        })(pipes[i].comp, pipes[i].propName, utils.hooks.getState(statePath, options), options);
                    }
                });
            }
        });

        tunkReact.connect = connect;

        function connect(stateOptions = {}, actionOptions = {}) {

            if (typeof stateOptions === 'function') {
                stateOptions = {};
                return connect_(arguments[0]);

            } else return connect_;

            function connect_(TargetComponent) {
                var stateOptions_;
                if (actionOptions) {
                    if(actionOptions.constructor === Object) {
                        for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                            if (actionOptions[x] && typeof actionOptions[x] === 'string')
                                tmp = actionOptions[x].split('.');
                                connectAction(TargetComponent.prototype, x, tmp[0], tmp[1]);
                        }
                    } else {
                        throw '[tunk-react]:the actions setting should be type of Object';
                    }
                    
                }

                if (stateOptions) {

                    var props = Object.keys(stateOptions), types;
                    if (props.length) {
                        TargetComponent.propTypes = TargetComponent.propTypes || {};
                        types = PropTypes.oneOfType([
                            PropTypes.number,
                            PropTypes.array,
                            PropTypes.bool,
                            PropTypes.object,
                            PropTypes.string,
                        ]);

                        for (var i = 0, l = props.length; i < l; i++) {
                            TargetComponent.propTypes[props[i]] = TargetComponent.propTypes[props[i]] || types;
                        }

                        stateOptions_ = {};

                        for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                            stateOptions_[x] = stateOptions[x].split('.');
                        }
                    }

                }

                TargetComponent.prototype['dispatch'] = function (actionPath) {
                    if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw 'the first argument should has dot between module name and action name: ' + actionPath;
                    actionPath = actionPath.split('.');
                    utils.dispatchAction(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                }

                function AgentComponent(props) {
                    Component.call(this, props);
                    this.state = {};
                    if (stateOptions_) for (var x in stateOptions_) {
                        this.state[x] = connectState(this, x, stateOptions_[x])
                    }
                }
                AgentComponent.prototype = new Component();

                Object.assign(AgentComponent.prototype, {
                    constructor: AgentComponent,
                    componentWillUnmount: function () {
                        var stateOption = this._tunkOptions_;
                        var tmp;
                        for (var x in stateOption) {
                            tmp = [];
                            for (var i = 0, l = connections[stateOption[x][0]].length; i < l; i++) {
                                if (connections[stateOption[x][0]][i].comp !== this) tmp.push(connections[stateOption[x][0]][i]);
                            }
                            connections[stateOption[x][0]] = tmp;
                        }
                    },
                    render: function () {
                        return React.createElement(TargetComponent, Object.assign({}, this.props, this.state));
                    }
                });
                return AgentComponent;
            }
        }

        function connectState(targetObject, propName, statePath) {
            if (!statePath[0] || !utils.modules[statePath[0]]) throw '[tunk]:unknown module name:' + statePath[0];
            connections[statePath[0]] = connections[statePath[0]] || [];
            connections[statePath[0]].push({
                comp: targetObject,
                propName: propName,
                statePath: statePath,
            });
            targetObject._tunkOptions_ = targetObject._tunkOptions_ || {};
            targetObject._tunkOptions_[propName] = statePath;
            //返回组件默认数据
            return utils.hooks.getState(statePath, utils.modules[statePath[0]].options);
        }

        function connectAction(target, propName, moduleName, actionName) {
            if(!actionName){
                var proto = getModule(moduleName).__proto__,
                    protoNames = Object.getOwnPropertyNames(proto);
                target[propName] = {};
                for (var i = 0, y = protoNames[0]; i < protoNames.length; i++ , y = protoNames[i]) if (proto[y].options) {
                    (function(moduleName, actionName){
                        target[propName][actionName] = function () {
                            utils.dispatchAction(moduleName, actionName, arguments)
                        };
                    })(moduleName, y)
                }
            }else {
                target[propName] = function () {
                    utils.dispatchAction(moduleName, actionName, arguments)
                };
            }
        }

        function getModule(moduleName) {
            if (!utils.modules[moduleName]) throw '[tunk]:unknown module name ' + moduleName;
            return utils.modules[moduleName];
        }
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = tunkReact;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return tunkReact;
        })
    }

})();





