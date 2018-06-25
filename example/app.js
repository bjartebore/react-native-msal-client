import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import MsalClient from 'react-native-msal-client';
const authority = 'https://login.microsoftonline.com/common';
const clientId = 'b0024ae1-263c-406a-8bc6-34aecf73a907';
const redirectUri =  `msal${clientId}://auth`;
const scopes = [
  'User.Read'
];

export default class msalExample extends Component {

  constructor(props) {
    super(props);

    this.authClient = new MsalClient(authority);

    this.state = {
      isLoggedin: false,
      name: '',
      userIdentifier: null,
    }
  }

  _handleLoginPress = () => {
    if (this.state.userIdentifier) {
      this.authClient.acquireTokenSilentAsync(clientId, scopes, this.state.userIdentifier)
        .then((result) => {
          this.setState({
            isLoggedin: true,
            name: result.userInfo.name,
            userIdentifier: result.userInfo.userIdentifier,
          });
        })
        .catch((err) => {
          console.log('error', err);
        })
    } else {
      this.authClient.acquireTokenAsync(clientId, scopes, redirectUri, '')
        .then((result)=> {

          this.setState({
            isLoggedin: true,
            name: result.userInfo.name,
            userIdentifier: result.userInfo.userIdentifier,
          });

          console.log('success', data);
        }).catch((err) => {
          console.log('error', err);
        })
      }

  }

  _handleLogoutPress = () => {
    this.setState({
      isLoggedin: false,
      name: '',
    });
  }

  renderLogin() {
    return (
      <Button title="login" onPress={this._handleLoginPress} />
    );
  }

  renderLogout() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Hi {this.state.name}!</Text>
        <Button title="logout" onPress={this._handleLogoutPress} />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.isLoggedin
            ? this.renderLogout()
            : this.renderLogin()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 20,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
