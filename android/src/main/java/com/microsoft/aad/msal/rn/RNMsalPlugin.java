/*******************************************************************************
 * Copyright (c) Microsoft Open Technologies, Inc.
 * All Rights Reserved
 * See License in the project root for license information.
 ******************************************************************************/

// Modifications by Bjarte Bore to work with React Native instead of Cordova

package com.microsoft.aad.msal.rn;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.util.HashMap;
import java.util.Map;


import com.facebook.react.bridge.WritableMap;
import com.microsoft.identity.client.*;
import com.microsoft.identity.client.exception.MsalException;

public class RNMsalPlugin extends ReactContextBaseJavaModule {


  public RNMsalPlugin(ReactApplicationContext reactContext) {
    super(reactContext);

    reactContext.addActivityEventListener(mActivityEventListener);
  }

  private PublicClientApplication client;

  @Override
  public String getName() {
    return "RNMsalPlugin";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    final Map<String, Object> errorCodes = new HashMap<>();

    constants.put("MSALErrorCode", errorCodes);

    return constants;
  }

  private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

      @Override
      public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
          super.onActivityResult(activity, requestCode, resultCode, data);

          client.handleInteractiveRequestRedirect(requestCode, resultCode, data);
      }

  };

  @ReactMethod
  public void acquireTokenAsync(
          String authority,
          String clientId,
          ReadableArray scopes,
          String redirectUri,
          String extraQueryParameters,
          Promise promise
  ) {
    final PublicClientApplication client;
    try {
      client = getOrCreateContext(authority, clientId);
    } catch (Exception e) {
      promise.reject(e);
      return;
    }
    Activity activity = getCurrentActivity();

    client.acquireToken(
            activity,
            scopes.toArrayList().toArray(new String[scopes.size()]),
            this.getAuthInteractiveCallback(promise));
  }

  @ReactMethod
  public void acquireTokenSilentAsync(
          String authority,
          String clientId,
          ReadableArray scopes,
          String userIdentitfier,
          Promise promise
  ) {
      final PublicClientApplication client;
      try {
          client = getOrCreateContext(authority, clientId);
      } catch (Exception e) {
          promise.reject(e);
          return;
      }

      IAccount account = client.getAccount(userIdentitfier);
      client.acquireTokenSilentAsync(
              scopes.toArrayList().toArray(new String[scopes.size()]),
              account,
              authority,
              false,
              this.getAuthInteractiveCallback(promise));
  }

  @ReactMethod
  public void tokenCacheDeleteItem(
          String authority,
          String clientId,
          String userIdentitfier,
          Promise promise
  ) {
      final PublicClientApplication client;
      try {
          client = getOrCreateContext(authority, clientId);
      } catch (Exception e) {
          promise.reject(e);
          return;
      }

      IAccount account = client.getAccount(userIdentitfier);
      if (client.removeAccount(account)) {
          promise.resolve(null);
      } else {
          promise.reject(new Exception("No such user"));
      }
  }

  private AuthenticationCallback getAuthInteractiveCallback(final Promise callbackPromise) {
    return new AuthenticationCallback() {
      @Override
      public void onSuccess(AuthenticationResult authenticationResult)
      {
        final WritableMap result = Arguments.createMap();
        result.putString("accessToken", authenticationResult.getAccessToken());
        result.putString("idToken", authenticationResult.getIdToken());
        result.putString("uniqueId", authenticationResult.getUniqueId());
        result.putDouble("expiresOn", authenticationResult.getExpiresOn().getTime());
        result.putMap("userInfo", Arguments.createMap());
        final WritableMap userInfo =  Arguments.createMap();
        userInfo.putString("userIdentifier", authenticationResult.getAccount().getAccountIdentifier().getIdentifier());
        /*
        userInfo.put("userID", authenticationResult.getUniqueId());
        userInfo.put("userName",authenticationResult.getAccount().getUsername());
        userInfo.put("userIdentifier",authenticationResult.getAccount().getAccountIdentifier());
        //userInfo.put("name", "");
        // userInfo.put("identityProvider", );
        */
        result.putMap("userInfo", userInfo);

        callbackPromise.resolve(result);
      }

      @Override
      public void onError(MsalException exception)
      {
        callbackPromise.reject(exception);
      }

      @Override
      public void onCancel() {
        callbackPromise.reject(new Exception());
      }
    };
  }

  private PublicClientApplication getOrCreateContext (String authority, String clientId) {

    if (this.client == null) {
      this.client = new PublicClientApplication(
              this.getReactApplicationContext().getApplicationContext(),
              clientId,
              authority
      );
    }
    return this.client;
  }

}
