<template>
  <div class="container-c">
    <h1>流式传输</h1>
    <span class="monospace" id="room-id-indicator">您的{{ roleDescription }}号：{{ roomID }}</span>
    <span v-if="!isReady">⠀{{ hint }}</span
    ><br /><br />
    <loading-ring v-if="!isReady" id="loading"></loading-ring><br />
    <h3 v-if="!isReady">{{ loadingDescription }}</h3>
    <video-player
      id="video-player-stream"
      :style="{ display: isReady ? 'block' : 'none' }"
    ></video-player>
  </div>
</template>

<script>
import { shared } from "@/main";
import { msg } from "@/utils/msg";
// import { transformSdp } from "@/utils/sdp";

import LoadingRing from "@/components/LoadingRing.vue";
import VideoPlayer from "@/components/VideoPlayer.vue";

export default {
  name: "StreamView",
  data() {
    return {
      connectionAttempts: 0,
      maxAttempts: 3,
      isReady: false,
      get roleDescription() {
        return this.isSlave ? "成员" : "房间";
      },
      get hint() {
        return this.isSlave
          ? "请耐心等待。正在全球互联网寻找您的伙伴..."
          : "号码已复制。请您将号码发送给您的伙伴。";
      },
      get loadingDescription() {
        return shared.app.mode == 1 ? "正在加入伙伴" : "正在等待伙伴";
      },
      get roomID() {
        return this.isSlave && shared.app.guestID ? shared.app.guestID : shared.app.roomID;
      },
      get isSlave() {
        return shared.app.mode == 1;
      },
    };
  },
  methods: {
    connectToPeer() {
      if (this.connectionAttempts >= this.maxAttempts) {
        msg.e(`连接失败: 已达到最大重试次数 ${this.maxAttempts}`);
        return;
      }

      const remotePeerId = `${shared.app.roomID}-data`;
      const dataPeer = shared.peers.local.data;

      // 确保peer已经就绪
      if (dataPeer.disconnected) {
        dataPeer.reconnect();
      }

      msg.i(`尝试连接到 ${remotePeerId} (第 ${this.connectionAttempts + 1} 次)`);

      const conn = dataPeer.connect(remotePeerId, {
        reliable: true,
      });

      conn.on("open", () => {
        conn.send(`connected-${shared.app.guestID}`);
        msg.i(`和 ${shared.app.roomID} 的连接已建立`);
        shared.peers.local.video.on("call", (call) => {
          call.answer();
          call.on("stream", (stream) => {
            msg.i("收到视频流");
            const video = document.getElementById("video-player-stream");
            video.srcObject = stream;
            video.load();
            video.play();
          });
        });
        this.isReady = true;
        shared.peers.remote.data = conn;
      });

      conn.on("error", (err) => {
        msg.e(`和 ${shared.app.roomID} 的连接建立失败: ${err.message}`);
        console.error(err);
        this.connectionAttempts++;
        // 延迟重试
        setTimeout(() => this.connectToPeer(), 1000);
      });

      conn.on("close", () => {
        msg.w("连接已关闭");
        shared.peers.remote.data = null;
      });
    },
  },
  mounted() {
    if (this.roomID === "") {
      this.$router.replace("/");
      return;
    }

    const that = this;

    if (this.isSlave) {
      const dataPeer = shared.peers.local.data;

      // 确保peer已经就绪后再连接
      if (dataPeer.open) {
        this.connectToPeer();
      } else {
        dataPeer.on("open", () => {
          this.connectToPeer();
        });
      }
    } else {
      navigator.clipboard.writeText(this.roomID);
      shared.peers.local.data.on("connection", (conn) => {
        conn.on("open", function () {
          msg.i(`已收到来自 ${conn.peer} 的连接`);
          shared.peers.remote.data = conn;
        });
        conn.on("data", function (data) {
          const status = data.toString().split("-")[0];
          const peerID = data.toString().split("-")[1];
          if (status === "connected") {
            msg.i(`和 ${conn.peer} 的连接已建立`);
            that.isReady = true;
            // const videoConstraints = {
            //   width: { min: 1920, ideal: 2560, max: 3840 },
            //   height: { min: 1080, ideal: 1440, max: 2160 },
            //   frameRate: { min: 30, ideal: 30, max: 60 },
            // };
            // const audioConstraints = {
            //   echoCancellation: false,
            //   noiseSuppression: false,
            //   autoGainControl: false,
            //   sampleRate: 48000,
            //   channelCount: 2,
            // };
            const stream = document.querySelector("#video-player-stream").captureStream();
            // stream.getVideoTracks()[0].applyConstraints(videoConstraints);
            // if (stream.getAudioTracks().length > 0) stream.getAudioTracks()[0].applyConstraints(audioConstraints);
            const call = shared.peers.local.video.call(`${peerID}-video`, stream);
            call; // prevent eslint error
          } else {
            msg.e(`收到无效消息：${data}`);
          }
        });
        conn.on("close", () => {
          msg.w("连接已关闭");
          shared.peers.remote.data = null;
        });
      });
    }

    ((el) => {
      el.src = shared.app.videoURL;
      el.load();
    })(document.querySelector("#video-player-stream"));
  },
  components: {
    "loading-ring": LoadingRing,
    "video-player": VideoPlayer,
  },
};
</script>

<style scoped>
#room-id-indicator {
  color: gray;
}

#loading {
  margin: 0 auto;
}
</style>
