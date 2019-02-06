import reduxModule from '../abstract/reduxModule'
import profileApi from "../../../api/profileApi";

const ACTIONS = {
  GET_PROFILE: 'get',
  SET_PROFILE: 'set',
  CLEAR_PROFILE: 'clear',
  GET_PLANNER_EVENTS: 'get planner events',
  TOGGLE_EDIT: 'toggle edit',
  SAVE_PROFILE: 'save profile',
  SAVE_PROFILE_FULFILLED: 'save profile fulfilled',
};

class Profile extends reduxModule {
  getNamespace () {
    return '[Profile]';
  }

  getInitialState () {
    return {
      isPending: false,
      isCompleted: false,
      isEdited: false,
      data: {
        username: '',
        fullName: '',
        email: '',
        country: null,
        city: '',
        avatar: '',
        birthday: '',
        danceStyles: [],
        otherDanceStyles: '',
        roles: []
      },
      gallery: {
        isPending: false,
        entities: []
      }
    };
  }

  defineActions () {
    const setProfile = this.createAction(ACTIONS.SET_PROFILE, profile => profile);

    const getProfile = this.thunkAction({
      actionName: ACTIONS.GET_PROFILE,
      actionMethod: profileApi.getProfile,
      pendingPath: 'isPending',
      fulfilledAction: setProfile
    });

    const clearProfile = this.resetToInitialState(ACTIONS.CLEAR_PROFILE);
    const toggleEdit = this.toggleIn(ACTIONS.TOGGLE_EDIT, 'isEdited');

    const saveProfileFulfilled = this.setIn(ACTIONS.SAVE_PROFILE_FULFILLED, 'data');

    const saveProfile = this.thunkAction({
      actionName: ACTIONS.SAVE_PROFILE,
      actionMethod: profileApi.saveProfile,
      pendingPath: 'isPending',
      fulfilledAction: (response) => (dispatch) => {
        dispatch(saveProfileFulfilled(response));
        dispatch(toggleEdit());
      }
    });

    return {
      setProfile,
      getProfile,
      clearProfile,
      toggleEdit,
      saveProfile
    }
  }

  defineReducers () {
    return {
      [ACTIONS.SET_PROFILE]: (state, {payload: profile}) => {
        return state
          .set('isCompleted', true)
          .setIn(['data'], profile)
      }
    }
  }
}

const profile = new Profile();
profile.init();

export const setProfile = profile.actions.setProfile;
export const getProfile = profile.actions.getProfile;

export default profile;
