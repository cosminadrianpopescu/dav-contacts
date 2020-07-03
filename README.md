Dav Contacts
========================================

This is a very simple android DAV contacts client. It does not take into
consideration the Android accounts and it does not synchronize with those.

It connects directly to the DAV server and synchronizes directly with the
server.

## Installation

You can download the latest release from the releases page and install it, or
you can build it.

## Building

```
git clone https://github.com/cosminadrianpopescu/dav-contacts
cd dav-contacts
npm install
ionic build --prod
npx cap add android
cp ./AndroidManifest.xml ./android/app/src/main/
npx cap copy
node ./resources/resources.js
cd android
./gradlew assembleRelease
```

After this you'll find the apk in
`android/app/build/outputs/apk/release/app-release-unsigned.apk`. You need
to sign this file before installing, like shown
[here](https://ionicframework.com/docs/v1/guide/publishing.html):

```
cd ./app/build/outputs/apk/release/
keytool -genkey -v -keystore my-release-key.keystore -alias cups-client -keyalg RSA -keysize 2048 -validity 10000
mv app-release-unsigned.apk cups.client.apk
jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore cups.client.apk cups-client
```
