<template>
  <div class="container-c">
    <h1>流式传输</h1>
    <span class="monospace" id="room-id-indicator">您的{{ roleDescription }}号：{{ roomID }}</span>
    <span v-if="!isSlave">⠀号码已复制。请您将号码发送给您的伙伴。</span><br /><br />
    <loading-ring v-if="!isReady" id="loading"></loading-ring><br />
    <h3 v-if="!isReady">{{ loadingDescription }}</h3>
    <h3 v-if="isReady">已连接</h3>
  </div>
</template>

<script>
import { shared } from "@/main";

import LoadingRing from "@/components/LoadingRing.vue";
import { msg } from "@/utils/msg";

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
        conn.send("connected");
        msg.i(`和 ${shared.app.roomID} 的连接已建立`);
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

      // 添加连接关闭处理
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
      msg.i("正在以 slave 身份与 master 建立连接");
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
          if (data === "connected") {
            msg.i(`和 ${conn.peer} 的连接已建立`);
            that.isReady = true;
          }
        });
        conn.on("close", () => {
          msg.w("连接已关闭");
          shared.peers.remote.data = null;
        });
      });
    }
  },
  components: {
    "loading-ring": LoadingRing,
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
