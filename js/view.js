// THIS SCRIPT IS FOR ALL THE VIEWS

let dayView = document.getElementById("daily");
let weekView = document.getElementById("week");
let monthView = document.getElementById("month");
let views = [dayView, weekView, monthView];

let viewButtons = document.getElementsByClassName("view-btn");
let currentView;

// Click on view buttons to allow selective viewing
const viewFunction = () => {
  for (let j = 0; j < viewButtons.length; j++) {
    viewButtons[j].onclick = function() {
      currentView = this.textContent.toLowerCase();
      chrome.storage.sync.get(["view"], function(result) {
        if (currentView !== result["view"]) {
          chrome.storage.sync.set({ view: currentView }, function() {
            hideViews(views);
          });
        }
      });
    };
  }
};

// Sort views to show the one selected
const hideViews = viewsArr => {
  chrome.storage.sync.get(["view"], function(result) {
    for (let k = 0; k < viewsArr.length; k++) {
      // If the view clicked on equals the result
      if (views[k].id === result["view"]) {
        view = result["view"];
        switch (view) {
          case "daily":
            createToday();
            break;
          case "week":
            createWeek();

            break;
          case "month":
            createMonth();
            break;
        }
        views[k].setAttribute("style", "display:flex");
      } else {
        views[k].setAttribute("style", "display:none");
      }
    }
  });
};

// Get the background image and set stylings
const backgroundImage = () => {
  chrome.storage.sync.get(["background"], function(result) {
    // chrome.topSites.get(addSites); // add topsites
    let page = document.getElementsByTagName("html");
    let backgroundInfo = document.getElementById("background-info");
    let backgroundLocation = document.getElementById("background-location");
    let backgroundSource = document.getElementById("background-source");

    // let photoLink = document.createElement("a");
    let photoLink = document.getElementById("photo-link");
    // photoLink.textContent = result.background.author;
    photoLink.textContent = result.background.author;
    photoLink.href = result.background.photoLink;

    page[0].style.background = `rgba(0,0,0,0.9) url(${result.background.url +
      `&w=${window.innerWidth}&dpi=2`}) no-repeat center center fixed`;
    page[0].style.backgroundSize = `cover`;

    backgroundLocation.textContent = result.background.location;

    backgroundInfo.addEventListener("mouseover", () => {
      backgroundLocation.style.opacity = 0;
      backgroundSource.style.opacity = 0.75;
    });

    backgroundInfo.addEventListener("mouseleave", () => {
      backgroundLocation.style.opacity = 0.75;
      backgroundSource.style.opacity = 0;
    });
    // &auto=format
    // &w=1500&dpi=1
    // console.log(result.background.url);
  });
};
