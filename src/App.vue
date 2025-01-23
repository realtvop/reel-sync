<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="topbar">
    <img src="./assets/logo.png" alt="ReelSync Logo" id="logo" />
    <div id="title">ReelSync</div>
  </div>
  <RouterView />
  <footer>
    <b style="font-weight: bold">Version {{ REELSYNC_PACKAGE_VERSION }}</b>
    Powered by WebRTC and other awesome web technologies. <br />
    Crafted with ❤ by kW.
  </footer>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      // eslint-disable-next-line no-undef
      REELSYNC_PACKAGE_VERSION: __APP_VERSION__,
    };
  },
};
</script>

<style scoped>
.topbar {
  font-size: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--topbar-height);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  mask-image: linear-gradient(180deg, white 85%, transparent 100%);
}

#title {
  font-weight: bold;
  /* text-shadow: 0 0 36px; */
}

footer {
  padding: 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8em;
  color: #888;
  pointer-events: none;
}

.topbar > img {
  padding: 6px;
}

.topbar > div {
  padding: 6px;
}

#logo {
  width: auto;
  height: 70%;
}

@media (prefers-color-scheme: dark) {
  #logo {
    filter: invert(1) sepia(1) saturate(0) hue-rotate(180deg) brightness(0.8) contrast(0.85);
  }
}
</style>
