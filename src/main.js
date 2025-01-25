import "./assets/main.css";
import "mdui";
import "mdui/mdui.css";
import { setColorScheme } from "mdui/functions/setColorScheme";
import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);
app.mount("#app");

setColorScheme("#666666");

export const shared = {
  app: {
    mode: 0,
    method: 0,
    roomID: "",
    guestID: "",
    videoURL: "",
    syncThread: null,
    pingThread: null,
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
