<template>
  <div class="container">
    <h2 class="page-title">Options</h2>
    <Toggle
      :key="1"
      :toggleItem="toggleItem"
      :description="'Change Photo Daily'"
      :name="'changePhoto'"
      :currentValue="userSettings['changePhoto']"
    />
    <Toggle
      :key="2"
      :toggleItem="toggleItem"
      :name="'newTab'"
      :currentValue="userSettings['newTab']"
      :description="'Default New Tab'"
    />
    <Toggle
      :key="3"
      :toggleItem="modifyNotificationPermission"
      :name="'notifications'"
      :currentValue="userSettings['notifications']"
      :description="'Get Notifications'"
    />

    <p class="notification-time-text">Set notifications:</p>
    <select
      @change="editNotificationTime($event.target.value)"
      :value="userSettings['notificationTime']"
      name="notification-time"
      id=""
    >
      <option value="0">0 minutes before</option>
      <option value="15">15 minutes before</option>
      <option value="30">30 minutes before</option>
      <option value="60">1 hour before</option>
    </select>
    <br />
    <br />
    <div>
      Select Photo from
      <span>
        <a
          href="https://unsplash.com/"
          target="_blank"
          rel="noopener noreferrer"
          >Unsplash</a
        ></span
      >
      <input
        id="photoURL"
        type="text"
        placeholder="https://unsplash.com/photos/NuBvAE6VfSM"
        v-model="photoLink"
      />
      <button class="button" @click="submitPhoto">Submit</button>
    </div>
    <br />
    <div>
      Select a photo from your computer (< 5MB)
      <button class="button" @click="uploadPhoto">Upload</button>
    </div>
    <p class="error">{{ error }}</p>
  </div>
</template>
<script>
import Toggle from "./Toggle";
export default {
  components: {
    Toggle,
  },
  data() {
    return {
      userSettings: {},
      photoLink: "",
      error: "",
    };
  },
  created() {
    this.getSettings();
    //   On created, get all the items from storage relating to the thing
  },
  methods: {
    editNotificationTime(newTime) {
      let oldTime = this.userSettings["notificationTime"];
      // if they are using notifications, please update all alarms for notifications
      chrome.permissions.contains(
        { permissions: ["notifications"] },
        (result) => {
          // if user is using notifications
          if (result) {
            chrome.alarms.getAll((alarms) => {
              if (alarms.length === 1) return; // use this if they only have one alarm

              for (let alarm of alarms) {
                if (alarm.name == "changeBackground") continue; // avoid this alarm

                // add previous notification time to scheduledTime to get original time
                let changeTime = new Date(alarm.scheduledTime);
                // Get original time
                changeTime.setMinutes(
                  changeTime.getMinutes() + parseInt(oldTime)
                );
                // Now make the change to the new time
                changeTime.setMinutes(
                  changeTime.getMinutes() - parseInt(newTime)
                );

                //  To test this, I will get all alarms and check their time in date format
                chrome.alarms.create(alarm.name, {
                  when: changeTime.getTime(),
                });
              }
            });
          }
        }
      );
      // hopefull this happens after everything so i can get the previous notification time
      this.userSettings["notificationTime"] = newTime;
      this.updateStorage();
    },

    modifyNotificationPermission(event, name) {
      // get the current setting for notifications from user settings
      if (this.userSettings["notifications"]) {
        // ask if user wants to disable notifications
        chrome.permissions.remove(
          {
            permissions: ["notifications"],
          },
          (removed) => {
            if (removed) {
              // The permissions have been removed.
              this.userSettings["notifications"] = false;
              this.updateStorage();
            }
          }
        );
      } else {
        // ask if user wants to enable notifications
        chrome.permissions.request(
          {
            permissions: ["notifications"],
          },
          (granted) => {
            if (granted) {
              this.userSettings["notifications"] = true;
              this.updateStorage();
            }
          }
        );
      }
    },

    toggleItem(event, name) {
      this.userSettings[name] = !this.userSettings[name];
      this.updateStorage();
    },

    getSettings() {
      chrome.storage.sync.get("userSettings", (result) => {
        //   Do this if a user does not have the right storage version of polus
        if (Object.keys(result).length === 0) {
          this.updateStorageVersion();
        } else {
          this.userSettings = result["userSettings"];
        }
      });
    },

    submitPhoto() {
      let arr = this.photoLink.split("/");
      let id = arr[arr.length - 1];
      let requestPhotoURL = `https://api.unsplash.com/photos/${id}/?client_id=fdf184d2efd7efc38157064835198f0ce7d9c4f7bfcec07df0d9e64378a8d630&`;
      fetch(requestPhotoURL, { mode: "cors", credentials: "omit" })
        .then((response) => {
          if (!response.ok) throw response.statusText;
          return response;
        })
        .then((response) => response.json())
        .then((photo) => {
          let url = photo.urls.raw;
          let location = photo.location.name
            ? `${photo.location.name}`
            : "Unknown";
          let author = photo.user.name ? `${photo.user.name}` : "Unknown";
          let photoLink = photo.links.html;
          let downloadLink = `https://unsplash.com/photos/${photo.id}/download?client_id=fdf184d2efd7efc38157064835198f0ce7d9c4f7bfcec07df0d9e64378a8d630&force=true`;
          let background = {
            url,
            location,
            author,
            photoLink,
            downloadLink,
          };
          chrome.storage.sync.set({ background }, () => {
            chrome.storage.local.remove("image");
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              chrome.tabs.reload(tabs[0].id);
            });
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },

    // Allow user to submit photo from os
    async handleFile() {
      const options = {
        types: [
          {
            description: "Image",
            accept: {
              "image/*": [".jpg"],
            },
          },
        ],
      };
      let [fileHandle] = await window.showOpenFilePicker(options);
      const file = await fileHandle.getFile(); // once a user picks an image return the path of that image
      //  Lets let the user do the reader on the load
      let reader = new FileReader();
      reader.addEventListener(
        "load",
        function () {
          // USE INDEXED DB INSTEAD
          chrome.storage.sync.set({ background: false }, () => {
            chrome.storage.local.set({ image: reader.result }, () => {
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  chrome.tabs.reload(tabs[0].id);
                }
              );
            });
          });
        },
        false
      );
      if (file.size < 4500000) {
        reader.readAsDataURL(file);
        this.error = "";
      } else {
        this.error = "File Size is too large";
      }
    },

    uploadPhoto() {
      this.handleFile();
    },

    // Do this if user doesnt have the updated storage
    updateStorageVersion() {
      this.userSettings = {
        changePhoto: true,
        indexOpen: false,
        newTab: true,
        notifications: false,
        notificationTime: "0",
        pmode: false,
        view: "week",
      };
      this.updateStorage();
    },

    updateStorage() {
      chrome.storage.sync.set({ userSettings: this.userSettings });
    },
  },
};
</script>

<style lang="scss" scoped>
.notification-time-text {
  margin: 0;
}

#photoURL {
  width: 95%;
  outline: none;
}

.button {
  outline: none;
  border: none;
  cursor: pointer;
  margin: 5px 0;
  padding: 0.5rem 1rem;
  color: white;
  background: rgb(17, 151, 212);
}

.error {
  color: red;
}
</style>