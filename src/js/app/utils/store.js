import Vue from "vue";

// https://stackoverflow.com/questions/57710800/when-should-i-use-vuex
// https://vuejs.org/v2/guide/reactivity.html

export const store = Vue.observable({
  signedIn: false,
});

export const mutations = {
  setSignedIn(bool) {
    store.signedIn = bool;
  },
};
