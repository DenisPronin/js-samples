import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

/**
 * This is abstraction for Redux. It's need for writing less code
 */
export class ReduxModule {
  constructor () {
    this._namespace = this.getNamespace();
    this._actions = {};
    this._reducers = {};
  }

  init () {
    this._initialState = fromJS(this.getInitialState());
    const actions = this.defineActions();
    const reducers = this._addNamespaceToReducers(this.defineReducers());
    Object.assign(this._actions, actions);
    Object.assign(this._reducers, reducers);
    this.reducers = handleActions(this._reducers, this._initialState);
    this.actions = this._actions;
  }

  getNamespace () {
    // implement in subclasses
  }

  getInitialState () {
    // implement in subclasses
  }

  defineActions () {
    // implement in subclasses
    // it should return hash of function
    /**
     * return {
       * action1,
       * action2
     * }
     */
  }

  defineReducers () {
    // implement in subclasses
    /*
    return {
    [actionName]: this.****Reducer()
    }
    or use this.addReducer()
     */
  }

  _addNamespaceToReducers (obj) {
    const result = {};
    for (let actionName in obj) {
        result[this.ns(actionName)] = obj[actionName];
    }
    return result;
  }

  ns (actionName) {
    return `${this._namespace} ${actionName}`;
  }

  createAction (actionName, actionFn) {
    return createAction(this.ns(actionName), actionFn);
  }

  thunkAction(options) {
    const {
      actionName,
      actionMethod,
      pendingPath,
      normalize = null,
      fulfilledAction = null,
      rejectedAction = null,
      fulfilledPath = ''
    } = options;

    const pendingAction = this.setIn(`${actionName} pending`, pendingPath);
    let _fulfilledAction = fulfilledAction;
    if (fulfilledPath) {
      _fulfilledAction = this.setIn(`${actionName} fulfilled`, fulfilledPath);
    }

    return (...args) => (dispatch, getState, token) => {
      dispatch(pendingAction(true));
      return actionMethod(...args, token)
        .then(({data: response}) => {
          if (normalize) {
            response = normalize(response);
          }

          if (_fulfilledAction) {
            dispatch(_fulfilledAction(response));
          }
          dispatch(pendingAction(false))
          return response;
        })
        .catch((error) => {
          if (error.data && error.data.message) {
            error = error.data.message;
          }

          console.error('Error in thunkAction()', error);
          if (rejectedAction) {
            dispatch(rejectedAction(error));
          }
          dispatch(pendingAction(false));
          throw error;
        })
    }
  }

  addReducer (actionName, reducerFn) {
    this._reducers[this.ns(actionName)] = reducerFn;
  }

  /** handler creators
   * handler = action + reducer
   **/
  createHandler (actionName, actionFn, reducerFn) {
    const action = this.createAction(actionName, actionFn);
    this.addReducer(actionName, reducerFn);
    return action;
  }

  /*
  * Reducers
  * */
  setInReducer (path) {
    return (state, {payload}) => {
      const pathArr = this._parsePath(path, payload);
      return state.setIn(pathArr, fromJS(payload.value));
    }
  }

  mergeInReducer (path) {
    return (state, {payload}) => {
      const pathArr = this._parsePath(path, payload);
      return state.mergeIn(pathArr, payload.options);
    }
  }

  toggleInReducer (path) {
    return (state, {payload}) => {
      const pathArr = this._parsePath(path, payload);
      return state.setIn(pathArr, !state.getIn(pathArr));
    }
  }

  /*
  * Handlers
  * */
  setIn (actionName, path) {
    const pathVars = this._getPathVars(path);
    const action = this._createActionWithDynamicArguments('value', pathVars);
    return this.createHandler(actionName, action, this.setInReducer(path));
  }

  mergeIn (actionName, path) {
    const pathVars = this._getPathVars(path);
    const action = this._createActionWithDynamicArguments('options', pathVars);
    return this.createHandler(actionName, action, this.mergeInReducer(path));
  }

  toggleIn (actionName, path) {
    const pathVars = this._getPathVars(path);
    const action = this._createActionWithDynamicArguments('', pathVars);
    const reducer = this.toggleInReducer(path);
    return this.createHandler(actionName, action, reducer);
  }

  /*
  * Utils
  * */
  _paramReg = /\{(.*?)}/g;

  _getPathVars (path) {
    let pathVars = [];
    path.split('.').forEach(item => {
      if (item.match(this._paramReg)) {
        const field = item.replace(this._paramReg, (match, _field) => _field);
        pathVars.push(field);
      }
    });
    return pathVars;
  };

  _parsePath (path, payload) {
    return path.split('.').map(item => {
      return item.replace(this._paramReg, (match, field) => payload[field]);
    });
  }

  _createActionWithDynamicArguments (mainFieldName, pathVars) {
    return (options, rest) => {
      const payload = {};

      if (mainFieldName) {
        payload[mainFieldName] = options;
      }

      pathVars.forEach(pathVar => {
        if (rest[pathVar]) {
          payload[pathVar] = rest[pathVar];
        }
      });

      return payload;
    };
  }
}

export default ReduxModule
