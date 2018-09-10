# react-native-msal-client

This is a simple wrapper around Microsofts [MSAL](https://github.com/samcolby/react-native-ms-adal/) library

## IOS Setup
## Requirements

* [React Native](https://facebook.github.io/react-native/) (tested on 0.55)
* [Cocoapods](https://cocoapods.org/)

## Installation

```sh
yarn add react-native-msal-client
```

Install [MSAL](https://github.com/AzureAD/microsoft-authentication-library-for-objc) with cocoapods

Add the following to the Podfile and run ```pod install``

```ruby
pod 'MSAL', :git => 'https://github.com/AzureAD/microsoft-authentication-library-for-objc.git', :tag => '0.1.3'
```


## Usage

```js
import MsalClient from 'react-native-msal-client';

const authClient = MsalClient('https://login.microsoftonline.com/common')

const clientId = '1ee9299a-9936-4aa9-92c5-b5602ee938d9';
const redirectUri = `msal${clientId}://auth`;
const scopes = ['email'];
const extraQueryParms = '';

authClient.acquireTokenAsync(clientId, scopes, redirectUri, '')
  .then((data)=> {

  }).catch((err) => {

  });
```

## Android Setup
## Requirements
**gradle 3.1.3** and **React native 0.55.4**

upgrade gradle see [Upgrading gradle](docs/UPGRADING_GRADLE.md)


##Installation

``` sh
npm install react-native-msal-client
```
or
``` sh
yarn add react-native-msal-client
```

Link the library
``` sh
react-native link react-native-msal-client
```

Add Browser tab activity to your AndroidManifest.xml make sure to replace [REPLACE_WITH_YOUR_CLIENT_ID] with your own client id

``` xml
    <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenSize"
        android:windowSoftInputMode="adjustResize">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
      <activity android:name="com.facebook.react.devsupport.DevSettingsActivity" />

      <!-- Browser tab activity -->
      <activity
        android:name="com.microsoft.identity.client.BrowserTabActivity">
        <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="msal[REPLACE_WITH_YOUR_CLIENT_ID]"
                android:host="auth" />
        </intent-filter>
    </activity>
```

## Usage

Import MsalClient and create auth settings constant
``` jsx
import MsalClient from 'react-native-msal-client';

const authSettings = {
  authority : "https://login.microsoftonline.com/common",
  clientId : "5b837b98-a971-4a65-a6d5-e2fb468b6a1e",
  scopes: ["User.Read"]
}

```

create a new instance of MsalClient passing in the authority
``` jsx

constructor(props){
    super(props);

    this.msalClient = new MsalClient(authSettings.authority);

    this.state = {
      isLoggedin: false,
      name : '',
      userIdentifier : ''
    }
  }

```

render a button 
``` jsx
render() {
    return (
      <View style={styles.container}>
        <Button onPress={this._loginAsync} title="Login"></Button>
      </View>
    );
  }
```

implement the login method, this is the async await way
``` jsx
_loginAsync = async () => {

    try {
      let result = await this.msalClient.acquireTokenAsync(authSettings.clientId, authSettings.scopes);
      
      this.setState({
        isLoggedin: true,
        name: result.userInfo.name,
        userIdentifier: result.userInfo.userIdentifier
      });

    } catch (error) {
      console.log(error);
    }
  }
```

Or us the promise way

``` jsx
    this.msalClient.acquireTokenAsync(authSettings.clientId, authSettings.scopes)
      .then(result => {
        this.setState({
          isLoggedin: true,
          name: result.userInfo.name,
          userIdentifier: result.userInfo.userIdentifier
        });
      })
      .catch(err => {
        console.log(err);
      });
```

this is the result object returned

``` json

{
    "accessToken":"eyJ0eXAiOiJKV......",
    "expiresOn":"1536328108575",
    "idToken":"eyJ0eXAi......",
    "uniqueId":"a7a25d3c-f0b4-4537-93f2-45e754jhrjf",
    "userInfo":{
        "identityProvider":"https://login.microsoftonline",
        "name":"FirstName LastName",
        "tenantId":"83b00e6c-0942-40c5-83a7-27d3dd67d9d9",
        "userID":"User.Id@Provider.com",
        "userIdentifier":"YTi00MGM1LTgzYTctMjdkM2RkNjdkOWQ5",
        "userName":"User.Name"
    }
}

```


