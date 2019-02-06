import React from 'react'
import { Container } from "reactstrap";
import PropTypes from 'prop-types'
import moment from "moment";
import ProfileForm from "./ProfileForm";
import Planner from "../planner/Planner";
import ProfileEditForm from "./ProfileEditForm";
import Loader from "../common/loader/Loader";

class Profile extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    profileState: PropTypes.object.isRequired,
    plannerState: PropTypes.object.isRequired,
    danceStylesState: PropTypes.object.isRequired,
    countries: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  componentDidMount () {
    const { profileState, actions } = this.props;
    if (!profileState.isCompleted && !profileState.isPending) {
      actions.getProfile();
    }

    const today = moment().format('YYYY-MM-DD');
    actions.getPlannerEvents({
      date: today,
      saved: true,
      attended: true,
      pageNumber: 0,
      pageSize: 20
    });
  }

  render () {
    const { token, profileState, plannerState, danceStylesState, countries, actions } = this.props;
    const { isEdited, data: profile } = profileState;

    if (!profileState.isCompleted && !profileState.isPending) return null;

    if ((profileState.isPending && !profileState.isCompleted) ||
        danceStylesState.isPending ||
        countries.isPending
    ) {
      return <Loader className='db-profile__loader' />
    }

    return (
      <div className='db-profile'>
        <Container>
          {!isEdited &&
            <ProfileForm
              token={token}
              profile={profile}
              danceStylesState={danceStylesState}
              countries={countries}
              onEdit={actions.toggleEdit}
              onRefreshToken={actions.startRefreshToken}
            />
          }
          {isEdited &&
            <ProfileEditForm
              token={token}
              profile={profile}
              danceStylesState={danceStylesState}
              countries={countries}
              onEdit={actions.toggleEdit}
              saveProfile={actions.saveProfile}
            />
          }

          <Planner
            planner={plannerState}
          />
        </Container>
      </div>
    )
  }
}

export default Profile;
