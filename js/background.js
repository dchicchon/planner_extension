// On extension installation
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ view: "week" });
  getPhoto();

  // When creating the alarm, find out when midnight is

  let date = new Date();
  let midnight = new Date().setHours(23, 59, 59);
  let ms = midnight.getTime() - date.getTime();
  chrome.alarms.create("changeBackground", {
    when: Date.now() + ms,
    periodInMinutes: 60 * 24
  });

  // Set cookies because cross origin request must be secure and recognized that it is a cors method
  chrome.cookies.set({
    url: "https://api.unsplash.com/",
    sameSite: "no_restriction",
    secure: true
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "changeBackground") {
    getPhoto();
  }
});

// Get new photo from collection https://unsplash.com/documentation
const getPhoto = () => {
  // This url hits an api endpoint to get a random photo and saves it to user's chrome storage
  let url =
    "https://api.unsplash.com/photos/random/?client_id=fdf184d2efd7efc38157064835198f0ce7d9c4f7bfcec07df0d9e64378a8d630&collections=8974511";

  fetch(url, { mode: "cors", credentials: "omit" })
    .then(response => {
      if (!response.ok) throw response.statusText;
      // console.log(response);
      return response;
    })
    .then(response => response.json())
    .then(function(photo) {
      console.log(photo);
      let url = photo.urls.raw;
      let location = photo.location.city
        ? `${photo.location.city}, ${photo.location.country}`
        : "Unknown";
      let author = photo.user.name ? `${photo.user.name}` : "Unknown";
      let photoLink = photo.links.html;
      chrome.storage.sync.set({
        background: { url, location, author, photoLink }
      });
    })
    .catch(err => console.log(`Fetch failed: ${err}`));
};
