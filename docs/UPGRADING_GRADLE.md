[back to readme](../README.md)

##Upgrading gradle

go to android/build.gradle and make sure it has google() and com.android.tools.build:gradle:3.1.3

``` groovy

buildscript {
    repositories {
        jcenter()
        google() //<----add this if missing
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:3.1.3'//<----add this if missing

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        mavenLocal()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
        google()//<----add this if missing
    }
}

``` 

go to android/gradle/wrapper/gradle-wrapper.properties and make sure it has gradle-4.4-all.zip

``` groovy

distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-4.4-all.zip

```

go to android/app/build.gradle and make sure you are targeting the correct sdk versions 

``` groovy
compileSdkVersion 27
    buildToolsVersion '27.0.3'

    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 27
        versionCode 1
        versionName "1.0"
        ndk {
            abiFilters "armeabi-v7a", "x86"
        }
    }
```

change compile to implementation under dependencies also add 'com.android.support:appcompat-v7:27.1.1' as a dependency.

``` groovy
    dependencies {
    implementation project(':react-native-msal-client')
    implementation fileTree(dir: "libs", include: ["*.jar"])
    implementation "com.facebook.react:react-native:+"  // From node_modules
    implementation 'com.android.support:appcompat-v7:27.1.1'
}
```

After doing any gradle changes its a god idea to cd to android and run
``` sh
gradlew clean
```