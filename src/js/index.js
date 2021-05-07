import Vue from "vue";
import App from "./app/App.vue"; // vue

function updateStorageVersion() {
    let userSettings = {
        view: "week",
        pmode: false,
        clock: true,
        date: true,
        changePhoto: true,
        newTab: true,
        indexOpen: false,
    };
    chrome.storage.sync.set({ 'userSettings': userSettings }, () => {
        checkOptions()
    });

}

function checkOptions() {
    chrome.storage.sync.get('userSettings', result => {
        // If not updated to the current version of the app
        if (Object.keys(result).length === 0) {
            updateStorageVersion();
        }
        // If we can have this as our new tab
        else {
            let { userSettings } = result
            console.log(userSettings)
            if (userSettings.newTab || userSettings.indexOpen) {
                userSettings.indexOpen = false
                chrome.storage.sync.set({ userSettings })
                new Vue({
                    el: "#app",
                    render: (createElement) => createElement(App)
                });
            } else {
                chrome.tabs.update({
                    url: "chrome-search://local-ntp/local-ntp.html",
                });
            }
        }
    })

    // If new tab is turned off
}

window.onload = () => {
    // check if we have a new tab or not
    checkOptions()


};
