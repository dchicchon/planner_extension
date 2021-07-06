import Vue from "vue";
import App from "./app/App.vue"; // vue
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

Vue.prototype.$firebase = firebase;

// This function returns the user if it exists. Else returns false

function updateStorageVersion() {
  let userSettings = {
    changePhoto: true,
    indexOpen: false,
    newTab: true,
    notifications: false,
    notificationTime: "0",
    pmode: false,
    view: "week",
  };
  chrome.storage.sync.set({ userSettings }, () => {
    checkOptions();
  });
}

function checkOptions() {
  chrome.storage.sync.get("userSettings", (result) => {
    // If not updated to the current version of the app
    if (Object.keys(result).length === 0) {
      updateStorageVersion();
    }
    // If we can have this as our new tab
    else {
      let { userSettings } = result;
      if (userSettings.newTab || userSettings.indexOpen) {
        userSettings.indexOpen = false;
        chrome.storage.sync.set({ userSettings });
        new Vue({
          el: "#app",
          render: (createElement) => createElement(App),
        });
      } else {
        chrome.tabs.update({
          url: "chrome-search://local-ntp/local-ntp.html",
        });
      }
    }
  });

  // If new tab is turned off
}

window.onload = () => {
  // check if we have a new tab or not
  var config = {
    apiKey: "AIzaSyC-jyQX_JbQnJAjADK3ApS1gyemkr-AqW8",
    authDomain: "polus-cc376.firebaseapp.com",
    databaseURL: "https://polus-cc376.firebaseio.com",
    projectId: "polus-cc376",
    storageBucket: "polus-cc376.appspot.com",
    messagingSenderId: "926662511983",
    appId: "1:926662511983:web:dbb9499dfe95d22c116c9a",
    measurementId: "G-VRXQZDBLBF",
  };
  firebase.initializeApp(config);
  
  // https://firebase.google.com/docs/firestore/manage-data/enable-offline
  // FIGURE THIS OUT LATER == offline persisentce does not work if more than one tab
  // firebase.firestore().enablePersistence().catch(err => {
  //   if (err.code == 'failed-precondition') {

  //   }
  // });
  // If we do this, it takes longer to load! Maybe consider using a promise based thing

  // firebase.auth().onAuthStateChanged((user) => {
  // $auth.signedIn = user;
  // Vue.prototype.$auth = Vue.observable({ signedIn: user });
  checkOptions();
  // });
};
