import "./assets/main.css";
import "mdui";
import "mdui/mdui.css";
import { setColorScheme } from "mdui/functions/setColorScheme";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import CryptoJS from "crypto-js";

const app = createApp(App);

app.use(router);
app.mount("#app");

setColorScheme("#666666");

export const shared = {
  app: {
    mode: 0,
    roomID: "",
    guestID: "",
    videoURL: "",
  },
  peers: {
    local: {
      data: null,
      video: null,
    },
    remote: {
      data: null,
      video: null,
    },
  },
};

window.exposed = {};
window.exposed.shared = shared;
window.exposed.CryptoJS = CryptoJS;
