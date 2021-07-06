<template>
  <div id="vuemain">
    <div id="view">
      <button @click="changeView('daily')" type="button" class="view-btn">
        Daily
      </button>
      <button @click="changeView('week')" type="button" class="view-btn">
        Week
      </button>
      <button @click="changeView('month')" type="button" class="view-btn">
        Month
      </button>
    </div>
    <section>
      <component :is="currentComponent"></component>
    </section>
  </div>
</template>

<script>
import Day from "./Day";
import Week from "./Week";
import Month from "./Month";

export default {
  components: {
    Day,
    Week,
    Month,
  },
  data() {
    return {
      currentComponent: "",
      userSettings: {},
    };
  },

  created() {
    chrome.storage.sync.get("userSettings", (result) => {
      let { userSettings } = result;
      this.userSettings = userSettings;
      this.switchComponent();
    });
  },

  methods: {
    switchComponent() {
      switch (this.userSettings.view) {
        case "daily":
          this.currentComponent = Day;
          break;
        case "week":
          this.currentComponent = Week;
          break;
        case "month":
          this.currentComponent = Month;
          break;
      }
    },
    changeView(type) {
      this.userSettings.view = type;
      let userSettings = this.userSettings;
      this.switchComponent();
      chrome.storage.sync.set({ userSettings });
    },
  },
};
</script>

<style lang="scss" scoped></style>
