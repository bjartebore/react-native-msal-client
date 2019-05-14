#import <Foundation/Foundation.h>

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#else
#import <Cocoa/Cocoa.h>
#endif

//! Project version number for MSAL.
FOUNDATION_EXPORT double MSAL__Framework_VersionNumber;

//! Project version string for MSAL.
FOUNDATION_EXPORT const unsigned char MSAL__Framework_VersionString[];

#import <MSALDefinitions.h>
#import <MSALRedirectUri.h>
#import <MSALError.h>
#import <MSALPublicClientApplicationConfig.h>
#import <MSALGlobalConfig.h>
#import <MSALLoggerConfig.h>
#import <MSALTelemetryConfig.h>
#import <MSALHTTPConfig.h>
#import <MSALCacheConfig.h>
#import <MSALPublicClientApplication.h>
#import <MSALSliceConfig.h>
#import <MSALResult.h>
#import <MSALAccount.h>
#import <MSALAccountId.h>
#import <MSALAuthority.h>
#import <MSALAADAuthority.h>
#import <MSALB2CAuthority.h>
#import <MSALADFSAuthority.h>
#import <MSALPublicClientStatusNotifications.h>
#import <MSALSilentTokenParameters.h>
#import <MSALInteractiveTokenParameters.h>
#import <MSALTokenParameters.h>
#import <MSALClaimsRequest.h>
#import <MSALIndividualClaimRequest.h>
#import <MSALIndividualClaimRequestAdditionalInfo.h>
#import <MSALJsonSerializable.h>
#import <MSALJsonDeserializable.h>
#import <MSALLogger.h>
#import <MSALTelemetry.h>


