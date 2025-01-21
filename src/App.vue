<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div class="topbar">
    <img src="./assets/icon_256x.png" alt="ReelSync Logo" id="logo" />
    <div id="title">ReelSync</div>
  </div>
  <RouterView />
  <footer>
    <!-- <b style="font-weight: bold;">ReelSync</b> -->
    Powered by WebRTC and other awesome web technologies. <br />
    Crafted with ❤ by kW.
  </footer>
</template>

<script>
export default {};
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#title {
  font-weight: bold;
  /* text-shadow: 0 0 12px; */
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
