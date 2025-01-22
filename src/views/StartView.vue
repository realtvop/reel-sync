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
      <reelsync-video-input id="video-input" @change="checkVideoValidity"></reelsync-video-input>
      <mdui-fab
        extended
        size="normal"
        variant="surface"
        icon="upload--rounded"
        @click="uploadVideo"
      >
        上传视频文件
      </mdui-fab>
      <br /><br />
      <mdui-button @click="createRoom" id="create-room-button" disabled>创建房间</mdui-button>
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
      <mdui-button @click="joinRoom" id="join-room-button" disabled>加入房间</mdui-button>
    </div>
  </div>
</template>

<script>
import { PeerID } from "@/utils/PeerID";
import { shared } from "@/main";
import { msg } from "@/utils/msg";

import Peer from "peerjs";
import VideoInput from "@/components/VideoInput.vue";

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
      } else {
        createRoomButton.setAttribute("disabled", true);
      }
    },
    createRoom() {
      const id = new PeerID().id;
      shared.app.roomID = id.raw;
      shared.peers.local.data = new Peer(id.data);
      shared.peers.local.video = new Peer(id.video);
      this.$router.push("/stream");
    },
    joinRoom() {
      const id = new PeerID().id;
      shared.app.guestID = id.raw;
      shared.peers.local.data = new Peer(id.data);
      shared.peers.local.video = new Peer(id.video);
      this.$router.push("/stream");
    }
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
  },
};
</script>

<style scoped>
mdui-text-field {
  width: calc(80vw);
  max-width: 360px;
}
</style>
