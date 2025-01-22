<template>
  <div class="container-c">
    <h1>开始</h1>
    <span>⠀调整选项并开始分享您的视频流。<br />⠀{{ modeDescription }}</span>
    <br />
    <mdui-switch
      id="mode-switch"
      style="margin: 0 auto"
      @click="changeMode"
      checked-icon="share--rounded"
      unchecked-icon="link--rounded"
      checked
    ></mdui-switch>
    <label id="mode-indicator">{{ modeName }}</label>
    <br />
    <div v-if="isMaster">
      <reelsync-video-input id="video-input" @change="onVideoUpload"></reelsync-video-input>
      <mdui-fab
        extended
        size="normal"
        variant="surface"
        icon="upload--rounded"
        @click="uploadVideo"
      >
        上传视频文件
      </mdui-fab>
      <reelsync-video-player style="display: none" id="video-player"></reelsync-video-player>
      <br /><br />
      <mdui-button @click="onCreateRequest" id="create-room-button" disabled>创建房间</mdui-button>
    </div>
    <div v-else>
      <mdui-text-field
        id="room-id-input"
        class="monospace"
        v-model="roomID"
        label="房间 ID"
        variant="outlined"
        maxlength="16"
        clearable
        counter
      ></mdui-text-field
      ><br />
      <mdui-button @click="onJoinRequest" id="join-room-button" disabled>加入房间</mdui-button>
    </div>
  </div>
</template>

<script>
import { PeerID } from "@/utils/PeerID";
import { shared } from "@/main";
import { msg } from "@/utils/msg";

import Peer from "peerjs";
import VideoInput from "@/components/VideoInput.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";

export default {
  data() {
    return {
      mode: 0,
      roomID: "",
      get modeName() {
        return this.mode === 0 ? "主节点模式" : "从节点模式";
      },
      get modeDescription() {
        return this.mode === 0
          ? "您可以创建房间并将您本地的视频文件分享给他人。"
          : "您可以加入其他人创建的房间并观看他们的视频流。";
      },
      get isMaster() {
        return this.mode === 0;
      },
    };
  },
  methods: {
    changeMode() {
      this.mode = document.getElementById("mode-switch").checked ? 1 : 0;
    },
    uploadVideo() {
      document.querySelector("#video-input").click();
    },
    checkVideoValidity() {
      const createRoomButton = document.getElementById("create-room-button");
      const videoInput = document.querySelector("#video-input");
      msg.i(`已获得视频文件：${videoInput.value}`);
      if (videoInput.value) {
        createRoomButton.removeAttribute("disabled");
        return true;
      } else {
        createRoomButton.setAttribute("disabled", true);
        return false;
      }
    },
    async getTurnNode() {
      const url = import.meta.env.VITE_NODE_SERVER_URL;
      console.log(url);
      const data = {
        ttl: 86400, // 请求体数据
      };
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          msg.e("TURN 节点请求失败");
        }
        const result = await response.json();
        return result;
      } catch (error) {
        msg.e("TURN 节点请求失败：", error);
        return false;
      }
    },
    async createRoom() {
      const cfg = await this.getTurnNode();
      const id = new PeerID().id;
      shared.app.roomID = id.raw;
      shared.peers.local.data = new Peer(id.data, { config: cfg });
      shared.peers.local.video = new Peer(id.video, { config: cfg });
      this.$router.push("/stream");
    },
    async joinRoom() {
      const cfg = (await this.getTurnNode()) ?? {};
      const id = new PeerID().id;
      shared.app.guestID = id.raw;
      shared.peers.local.data = new Peer(id.data, { config: cfg });
      shared.peers.local.video = new Peer(id.video, { config: cfg });
      this.$router.push("/stream");
    },
    async onCreateRequest() {
      document.getElementById("create-room-button").setAttribute("loading", true);
      document.getElementById("create-room-button").setAttribute("disabled", true);
      await this.createRoom();
      document.getElementById("create-room-button").removeAttribute("loading");
      document.getElementById("create-room-button").removeAttribute("disabled");
    },
    async onJoinRequest() {
      document.getElementById("join-room-button").setAttribute("loading", true);
      document.getElementById("join-room-button").setAttribute("disabled", true);
      await this.joinRoom();
      document.getElementById("join-room-button").removeAttribute("loading");
      document.getElementById("join-room-button").removeAttribute("disabled");
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      const videoURL = URL.createObjectURL(file);
      shared.app.videoURL = videoURL;
    },
    onVideoUpload(event) {
      if (this.checkVideoValidity()) {
        this.handleFileChange(event);
      }
    },
  },
  watch: {
    mode(value) {
      shared.app.mode = value;
      msg.i(`全局模式改变：${shared.app.mode === 0 ? "master" : "slave"}`);
    },
    roomID(value) {
      const joinRoomButton = document.getElementById("join-room-button");
      const roomIDInput = document.getElementById("room-id-input");
      if (value.length === 16) {
        joinRoomButton.removeAttribute("disabled");
        roomIDInput.removeAttribute("helper");
        shared.app.roomID = value;
      } else if (value.length == 0) {
        joinRoomButton.setAttribute("disabled", true);
        roomIDInput.setAttribute("helper", "请提供一个房间 ID。");
      } else {
        joinRoomButton.setAttribute("disabled", true);
        roomIDInput.setAttribute("helper", "房间 ID 格式不正确。");
      }
    },
  },
  components: {
    "reelsync-video-input": VideoInput,
    "reelsync-video-player": VideoPlayer,
  },
};
</script>

<style scoped>
mdui-text-field {
  width: calc(80vw);
  max-width: 360px;
}
</style>
