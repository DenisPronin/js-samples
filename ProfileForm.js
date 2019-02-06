import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Button } from "reactstrap";
import ProfileRole from "./ProfileRole";
import ProfileFormField from "./ProfileFormField";
import {getUnsecureImage} from "../../api/apiConfig";

class ProfileForm extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    profile: PropTypes.object.isRequired,
    danceStylesState: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onRefreshToken: PropTypes.func.isRequired
  };

  startEdit = () => {
    this.props.onEdit();
  };

  render() {
    const {token, profile, danceStylesState, countries} = this.props;

    const countryObj = countries.entities[profile.country];
    const country = countryObj ? countryObj.title : '';
    const avatar = getUnsecureImage(profile.avatar);

    return (
      <React.Fragment>
        <Row className='db-profile__row'>
          <Col sm={4}>
            <img src={avatar} className='db-profile__avatar' alt=""/>
          </Col>

          <Col sm={4}>

            <ProfileFormField
              label='Username'
              field='username'
              value={profile.username}
              privacySettings={profile.privacySettings}
            />

            <ProfileFormField
              label='Full name'
              field='fullName'
              value={profile.fullName}
              privacySettings={profile.privacySettings}
            />

            <ProfileFormField
              label='Country'
              field='country'
              value={country}
              privacySettings={profile.privacySettings}
            />

            <ProfileFormField
              label='City'
              field='city'
              value={profile.city}
              privacySettings={profile.privacySettings}
            />

            <ProfileFormField
              label='Birthday'
              field='birthday'
              value={profile.birthday}
              privacySettings={profile.privacySettings}
            />

          </Col>

          <Col sm={4}>
            <div className='db-profile__label'>Dance styles</div>
            <ul className='db-profile__list'>
              {profile.danceStyles.map(id => {
                const danceStyle = danceStylesState.entities[id];

                return (
                  <li key={`danceStyle-${id}`} className='db-profile__list-item'>
                    {danceStyle.title}
                  </li>
                );
              })}
              <li key={`danceStyle-other`} className='db-profile__list-item'>
                {profile.otherDanceStyles}
              </li>
            </ul>

            <Button className='db-profile__edit-btn btn-round' onClick={this.startEdit}>
              Edit profile
            </Button>
          </Col>

        </Row>

        <hr/>

        <Row className='db-profile__row'>
          <Col sm={12}>
            <div className='db-profile__roles'>
              {profile.roles.map(role => {
                if (!role.enabled) return null;

                return (
                  <ProfileRole
                    key={`profile-role-${role.id}`}
                    role={role}
                    token={token}
                  />
                );
              })}
            </div>
          </Col>
        </Row>

        <hr/>

      </React.Fragment>
    )
  }
}

export default ProfileForm;
