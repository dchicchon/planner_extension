<template>
  <div class="container">
    <h2 class="page-title">Account</h2>
    <div class="account-container">
      <!-- If they are not signed in, show them the signup/signin components -->
      <div v-if="!userLoggedIn">
        <div v-if="page === 'signup'">
          <h3 class="signup-text">Join Polus</h3>
          <button @click="signUpWithGoogle" id="Auth:Google" class="social-btn">
            <div style="display: inline-flex">
              <img />
              <div class="social-text">Continue with Google</div>
            </div>
          </button>
          <div id="orContainer">
            <div class="orBar"></div>
            <div class="or">or</div>
            <div class="orBar"></div>
          </div>
          <div class="email-btn-container">
            <button class="email-btn">
              <div class="btn-content-container">
                <div class="email-btn-icon"></div>
                <div class="email-btn-text">Join with Email</div>
              </div>
            </button>
          </div>
          <div class="terms">
            By joining, I agree to Polus's
            <a
              class="term-link"
              href="https://danielchicchon.io/polus/terms"
              target="_blank"
              rel="noopener noreferrer"
              >TOS</a
            >
            and
            <a
              class="term-link"
              href="https://danielchicchon.io/polus/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </a>
          </div>
          <div class="login">
            Already a member?
            <button
              @click="page = 'login'"
              id="Auth:ToggleLink"
              class="login-btn"
            >
              Login
            </button>
          </div>
        </div>
        <div v-else-if="page === 'login'">
          <h3 class="signup-text">Login</h3>
          <label for="username">Username</label>
          <input type="text" />

          <label for="password">Password</label>
          <input type="text" />
          <div class="social-signup-board">
            <button @click="signUpWithGoogle">
              <span>Google</span>
            </button>
          </div>
          <div class="login">
            Not a member?
            <button
              @click="page = 'signup'"
              id="Auth:ToggleLink"
              class="login-btn"
            >
              Signup
            </button>
          </div>
        </div>
      </div>
      <div v-if="userLoggedIn">
        <h3 class="signup-text">Welcome User!</h3>
        <button @click="signOut">Logout</button>
        <button @click="testFirestore">Add to firestore</button>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

export default {
  data() {
    return {
      user: "",
      userLoggedIn: Boolean,
      page: "",
    };
  },
  beforeCreate() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.userLoggedIn = true;
      } else {
        this.userLoggedIn = false;
        this.page = "login";
      }
    });
  },
  created() {
    // Check if user is logged in
    // If user is logged in -> this.userLoggedIn = true
  },
  methods: {
    signUpWithGoogle() {
      console.log("GET TOKEN");
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        console.log(token);
        let credential = firebase.auth.GoogleAuthProvider.credential(
          null,
          token
        );
        firebase
          .auth()
          .signInWithCredential(credential)
          .then((result) => {
            // lets check if they are in the database already
            let { uid } = result.user;
            let db = firebase.firestore();
            let userRef = db.collection("users").doc(uid);
            userRef
              .get()
              .then((doc) => {
                if (doc.exists) {
                  console.log("User is in database");
                } else {
                  console.log("User not in database");
                  console.log("MIGRATRING...");
                  // Get all data from chrome storage sync and add it to firebase
                  chrome.storage.sync.get(null, (result) => {
                    userRef
                      .set(result)
                      .then((result) => {
                        console.log("Document successfully written");
                        console.log(result);
                      })
                      .catch((error) => {
                        console.error("Error in writting document:", error);
                      });
                  });
                }
              })
              .catch((error) => {
                console.error("Error in getting document:", error);
              });
          })
          .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            if (errorCode === "auth/account-exists-with-different-credential") {
              alert("Email already associated with another account.");
              // Handle account linking here, if using.
            } else {
              console.error(error);
            }
          });
      });
    },

    signOut() {
      console.log("Sign out");
      firebase.auth().signOut();
    },

    // This occurs when a user SignsUp for the first time and decides to migrate their data
    migrateData() {},

    // testing adding data and getting d ata
    testFirestore() {
      let db = firebase.firestore();

      // Getting Data
      // db.collection("entries")
      //   .add({
      //     text: "Hello World",
      //     key: "1230jdvfois",
      //     active: true,
      //     color: "blue",
      //   })
      //   .then((docRef) => {
      //     console.log("Document written with ID:", docRef.id);
      //   })
      //   .catch((error) => {
      //     console.error("Error adding document:", error);
      //   });

      // Reading Data
      db.collection("entries")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.id);
            console.log(doc.data());
          });
        })
        .catch((error) => {
          console.error("Error getting documents:", error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.signup-text {
  font-weight: 200;
}
.term-link {
  color: #757575;
  text-decoration: underline;
}
.social-btn {
  width: 100%;
  border: 1px solid #9e9e9e;
  cursor: pointer;
  margin: 0px auto 8px;
  outline: none;
  min-height: 42px;
  border-radius: 3px;
  background-color: #ffffff;
  .social-text {
    font-size: 16px;
    margin-top: 2px;
    font-weight: 600;
    line-height: 22px;
    margin-left: 10px;
  }
}

#orContainer {
  display: flex;
  padding: 5px 0px 10px;
  .orBar {
    width: 44%;
    height: 1px;
    margin-top: 10px;
    background-color: #bdbdbd;
  }
  .or {
    color: #9e9e9e;
    width: 12%;
    font-size: 14px;
    text-align: center;
    font-weight: 600;
  }
}

.email-btn-container {
  margin: 5px auto 0;
  .email-btn {
    border-color: rgb(17, 151, 212);
    background-color: rgb(17, 151, 212);
    width: 100%;
    overflow: hidden;
    cursor: pointer;
    height: 40px;
    outline: none;
    padding: 0px 16px;
    box-shadow: none;
    text-shadow: none;
    border-style: solid;
    border-width: 1px;
    border-radius: 3px;
    .btn-content-container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .email-btn-icon {
        order: 1;
        display: flex;
        margin-right: 10px;
      }
      .email-btn-text {
        font-size: 14px;
        color: rgb(255, 255, 255);
        order: 2;
        overflow: hidden;
        font-style: normal;
        font-family: SuisseIntl, BlinkMacSystemFont, "Segoe UI", Roboto,
          Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
          "Segoe UI Symbol";
        font-weight: 600;
        white-space: nowrap;
        font-stretch: normal;
        text-overflow: ellipsis;
        letter-spacing: normal;
        text-shadow: none !important;
        text-transform: none !important;
      }
    }
  }
}

.login {
  color: #212121;
  font-size: 14px;
  margin-top: 16px;
  text-align: left;
  .login-btn {
    font: inherit;
    color: #3d68fb;
    border: none;
    cursor: pointer;
    outline: inherit;
    padding: 0px;
    background: none;
    text-decoration: underline;
  }
}
</style>
