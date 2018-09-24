
package com.reactlibrary;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.microsoft.identity.client.AuthenticationCallback;
import com.microsoft.identity.client.AuthenticationResult;
import com.microsoft.identity.client.MsalClientException;
import com.microsoft.identity.client.MsalException;
import com.microsoft.identity.client.PublicClientApplication;
import com.microsoft.identity.client.User;

public class RNMsalPlugin extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static PublicClientApplication _publicClientApplication;

    public RNMsalPlugin(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "RNMsalPlugin";
    }

    @ReactMethod
    public void acquireTokenAsync(String authority, String clientId, String scopes, String extraParameters, final Promise promise) {
        try {

            getOrCreatePublicationClient(clientId, authority).acquireToken(this.getCurrentActivity(), scopes.split(","), "", null, extraParameters, handleResult(promise));

        } catch (Exception ex) {
            promise.reject(ex);
        }
    }

    @ReactMethod
    public void acquireTokenSilentAsync(String authority, String clientId, String scopes, String userIdentitfier, final Promise promise){

        try {
            PublicClientApplication publicClientApplication = getOrCreatePublicationClient(clientId, authority);
            
            User user = publicClientApplication.getUser(userIdentitfier);

            publicClientApplication.acquireTokenSilentAsync(scopes.split(","), user, handleResult(promise));

        } catch (Exception ex) {
            promise.reject(ex);
        }
    }

    private AuthenticationCallback handleResult(final Promise promise){
       return new AuthenticationCallback() {
            @Override
            public void onSuccess(AuthenticationResult authenticationResult) {
                promise.resolve(msalResultToDictionary(authenticationResult));
            }

            @Override
            public void onError(MsalException exception) {
                promise.reject(exception);
            }

            @Override
            public void onCancel() {
                promise.reject("userCancel", "userCancel");
            }
        };
    }

    private PublicClientApplication getOrCreatePublicationClient(String clientId, String authority) {
        if (_publicClientApplication == null) {
            _publicClientApplication = new PublicClientApplication(this.getReactApplicationContext(), clientId, authority);
        }
        return _publicClientApplication;
    }

    private WritableMap msalResultToDictionary(AuthenticationResult result) {

        WritableMap resultData = new WritableNativeMap();
        resultData.putString("accessToken", result.getAccessToken());
        resultData.putString("idToken", result.getIdToken());
        resultData.putString("uniqueId", result.getUniqueId());

        if (result.getExpiresOn() != null) {
            resultData.putString("expiresOn", String.format("%s", result.getExpiresOn().getTime()));
        }

        resultData.putMap("userInfo", msalUserToDictionary(result.getUser(), result.getTenantId()));

        return resultData;
    }

    private WritableMap msalUserToDictionary(User user, String tenantId) {
        WritableMap resultData = new WritableNativeMap();

        resultData.putString("userID", user.getDisplayableId());
        resultData.putString("userName", user.getDisplayableId());
        resultData.putString("userIdentifier", user.getUserIdentifier());
        resultData.putString("name", user.getName());
        resultData.putString("identityProvider", user.getIdentityProvider());
        resultData.putString("tenantId", tenantId);

        return resultData;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        _publicClientApplication.handleInteractiveRequestRedirect(requestCode, resultCode, data);
    }
}