#import "RNMsalPlugin.h"

#import "React/RCTLog.h"
#import <MSAL/MSAL.h>
@implementation RNMsalPlugin

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(acquireTokenAsync,
                  authority:(NSString *)authority
                   clientId:(NSString *)clientId
                     scopes:(NSArray<NSString*>*)scopes
                redirectUri:(NSString *)redirectUri
            extraQueryParms:(NSString*)extraQueryParms
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject )
{
    NSError* error = nil;
    MSALPublicClientApplication* context = [RNMsalPlugin getOrCreateClientApplication:authority withClientId:clientId error:&error];

    if (error) {
        reject(@"TOKEN_ERROR", error.description, error);
        return;
    }

    [context acquireTokenForScopes:scopes
              extraScopesToConsent:nil
                              user:nil
                        uiBehavior:MSALUIBehaviorDefault
              extraQueryParameters:nil
                         authority:authority
                     correlationId:nil
                   completionBlock:^(MSALResult *result, NSError *error)
     {
         if(error) {
             reject(@"TOKEN_ERROR", error.description, error);
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

RCT_REMAP_METHOD(acquireTokenSilentAsync,
                 authority:(NSString *)authority
                 clientId:(NSString *)clientId
                 scopes:(NSArray<NSString*>*)scopes
                 userIdentitfier:(NSString*)userIdentifier
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    NSError* error = nil;
    MSALPublicClientApplication* context = [RNMsalPlugin getOrCreateClientApplication:authority withClientId:clientId error:&error];

    if (error) {
        reject(@"TOKEN_ERROR", error.description, error);
        return;
    }

    MSALUser* user = [context userForIdentifier:userIdentifier error:&error];

    if (error) {
        reject(@"TOKEN_ERROR", error.description, error);
        return;
    }

    [context acquireTokenSilentForScopes:scopes
                                    user:user
                               authority:authority
                         completionBlock:^(MSALResult *result, NSError *error) {
                             if(error) {
                                reject(@"TOKEN_ERROR", error.description, error);
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

static NSMutableDictionary* existingApplications = nil;

+ (MSALPublicClientApplication* )getOrCreateClientApplication:(NSString*)authority
                                                 withClientId:(NSString*)clientId error:(NSError* __autoreleasing*)error
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
