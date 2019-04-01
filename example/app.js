import React, { useState } from 'react';
import {
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
