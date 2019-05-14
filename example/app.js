import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';

import MsalClient from 'react-native-msal-client';

const authority = 'https://login.microsoftonline.com/common';
const clientId = '1ee9299a-9936-4aa9-92c5-b5602ee938d9';
const redirectUri = `msal${clientId}://auth`;
const scopes = [
  'email',
];

export default () => {
  const [authClient] = useState(() => new MsalClient(authority));
  const [loginState, setLoginState] = useState({
    isLoggedin: false,
    name: '',
    userIdentifier: null,
  });


  const _handleLoginPress = async () => {
    let result;
    try {
      if (loginState.userIdentifier) {
        result = await authClient.acquireTokenSilentAsync(clientId, scopes, loginState.userIdentifier);
      } else {
        result = await authClient.acquireTokenAsync(clientId, scopes, redirectUri);
      }

      setLoginState({
        isLoggedin: true,
        name: result.userInfo.name,
        userIdentifier: result.userInfo.userIdentifier,
      });
    } catch (err) {
      console.log(err, err.code, err.domain, err.message);
    }
  };

  const _handleLogoutPress = () => {
    setLoginState({
      isLoggedin: false,
      name: '',
      userIdentifier: null,
    });
  };

  const renderLogin = () => (
    <Button title="login" onPress={_handleLoginPress} />
  );

  const renderLogout = () => (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        {`Hi ${loginState.name}! `}
      </Text>
      <Button title="logout" onPress={_handleLogoutPress} />
    </View>
  );

  return (
    <View style={styles.container}>
      {
        loginState.isLoggedin
          ? renderLogout()
          : renderLogin()
      }
    </View>
  );
};


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
