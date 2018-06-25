#import "RNMsalPlugin.h"
#import "React/RCTConvert.h"
#import "React/RCTLog.h"
#import <MSAL/MSAL.h>

@implementation RNMsalPlugin

RCT_EXPORT_MODULE();

static NSMutableDictionary* existingApplications = nil;

- (NSDictionary *)constantsToExport
{
    return @{ @"MSALErrorCode" :
                  @{
                      @"InvalidParameter" : @(MSALErrorInvalidParameter),
                      @"RedirectSchemeNotRegistered" : @(MSALErrorRedirectSchemeNotRegistered),
                      @"InvalidRequest" : @(MSALErrorInvalidRequest),
                      @"InvalidClient" : @(MSALErrorInvalidClient),
                      @"FailedAuthorityValidation" : @(MSALErrorFailedAuthorityValidation),
                      @"InteractionRequired" : @(MSALErrorInteractionRequired),
                      @"MismatchedUser" : @(MSALErrorMismatchedUser),
                      @"NoAuthorizationResponse" : @(MSALErrorNoAuthorizationResponse),
                      @"BadAuthorizationResponse" : @(MSALErrorBadAuthorizationResponse),
                      @"AuthorizationFailed" : @(MSALErrorAuthorizationFailed),
                      @"NoAccessTokenInResponse" : @(MSALErrorNoAccessTokenInResponse),
                      @"TokenCacheItemFailure" : @(MSALErrorTokenCacheItemFailure),
                      @"AmbiguousAuthority" : @(MSALErrorAmbiguousAuthority),
                      @"UserNotFound" : @(MSALErrorUserNotFound),
                      @"NoAccessTokensFound" : @(MSALErrorNoAccessTokensFound),
                      @"WrapperCacheFailure" : @(MSALErrorWrapperCacheFailure),
                      @"NetworkFailure" : @(MSALErrorNetworkFailure),
                      @"UserCanceled" : @(MSALErrorUserCanceled),
                      @"SessionCanceled" : @(MSALErrorSessionCanceled),
                      @"InteractiveSessionAlreadyRunning" : @(MSALErrorInteractiveSessionAlreadyRunning),
                      @"NoViewController" : @(MSALErrorNoViewController),
                      @"Internal": @(MSALErrorInternal),
                      @"InvalidState": @(MSALErrorInvalidState),
                      @"InvalidResponse": @(MSALErrorInvalidResponse)

                      }
              };
}

RCT_REMAP_METHOD(acquireTokenAsync,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 redirectUri:(NSString *)redirectUri
                 extraQueryParms:(NSString*)extraQueryParms
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject )
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority withClientId:clientId error:&error];

        if (error) {
            @throw(error);
        }

        [clientApplication acquireTokenForScopes:scopes
                  extraScopesToConsent:nil
                                  user:nil
                            uiBehavior:MSALUIBehaviorDefault
                  extraQueryParameters:nil
                             authority:authority
                         correlationId:nil
                       completionBlock:^(MSALResult *result, NSError *error)
         {
             if(error) {
                 reject(error.domain, error.description, error);
             } else {
                 resolve(@{
                           @"accessToken": result.accessToken,
                           @"idToken": result.idToken,
                           @"userInfo": @{
                                   @"userId": result.user.uid,
                                   @"userName": result.user.displayableId,
                                   @"userIdentifier": result.user.userIdentifier,
                                   @"name": result.user.name,
                                   @"identityProvider": result.user.identityProvider,
                                   @"tenantId": result.tenantId
                                   }
                           });
             }

         }];
    }
    @catch (NSError* error)
    {
        reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
    }

}

RCT_REMAP_METHOD(acquireTokenSilentAsync,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 userIdentitfier:(NSString*)userIdentifier
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSError* error = nil;
        MSALPublicClientApplication* clientApplication = [RNMsalPlugin getOrCreateClientApplication:authority
                                                                             withClientId:clientId
                                                                                    error:&error];

        if (error) {
            @throw(error);
        }

        MSALUser* user = [clientApplication userForIdentifier:userIdentifier error:&error];

        if (error) {
            @throw(error);
        }

        [clientApplication acquireTokenSilentForScopes:scopes
                                        user:user
                                   authority:authority
                             completionBlock:^(MSALResult *result, NSError *error) {
                                 if(error) {
                                     reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
                                 } else {
                                     resolve(@{
                                               @"accessToken": result.accessToken,
                                               @"idToken": result.idToken,
                                               @"userInfo": @{
                                                       @"userId": result.user.uid,
                                                       @"userName": result.user.displayableId,
                                                       @"userIdentifier": result.user.userIdentifier,
                                                       @"name": result.user.name,
                                                       @"identityProvider": result.user.identityProvider,
                                                       @"tenantId": result.tenantId
                                                       }
                                               });
                                 }
                             }];

    }
    @catch(NSError* error)
    {
        reject([[NSString alloc] initWithFormat:@"%d", (int)error.code], error.description, error);
    }
}

+ (MSALPublicClientApplication* )getOrCreateClientApplication:(NSString*)authority
                                                 withClientId:(NSString*)clientId
                                                        error:(NSError* __autoreleasing*)error
{
    if (!existingApplications)
    {
        existingApplications = [NSMutableDictionary dictionaryWithCapacity:1];
    }

    MSALPublicClientApplication* clientApplication = [existingApplications objectForKey:authority];

    if (!clientApplication)
    {
        NSError* _error;
        clientApplication = [[MSALPublicClientApplication alloc] initWithClientId:clientId authority:authority error:&_error];
        if (_error != nil)
        {
            *error = _error;
        }
        [existingApplications setObject:clientApplication forKey:authority];
    }
    return clientApplication;
}
@end
