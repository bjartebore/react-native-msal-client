import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import MsalClient from 'react-native-msal-client';
const authority = 'https://login.microsoftonline.com/tfp/esmartdroneb2c.onmicrosoft.com/B2C_1_SI';
const clientId = 'f9a4a5a2-7866-4317-ab87-19b3acf350e2';
const redirectUri = `msal${clientId}://auth`;
const scopes = [
  'https://esmartdroneb2c.onmicrosoft.com/esmartFacadeAPI/write',
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

          console.log('success', result);
        }).catch((err) => {
          debugger;
          console.log('error', err);
        })
      }

  }

  _handleLogoutPress = () => {
    this.setState({
      isLoggedin: false,
      name: '',
      userIdentifier: null,
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
