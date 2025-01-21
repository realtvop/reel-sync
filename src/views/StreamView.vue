<template>
  <div class="container-c">
    <h1>流式传输</h1>
    <span class="monospace" id="room-id-indicator">您的房间号：{{ roomID }}</span>
    <span>⠀号码已复制。请您将号码发送给您的伙伴。</span><br /><br />
    <mdui-circular-progress v-if="!isConnected" id="loading"></mdui-circular-progress><br />
    <h3>正在等待伙伴</h3>
  </div>
</template>

<script>
import { shared } from "@/main";

export default {
  name: "StreamView",
  data() {
    return {
      get roomID() {
        return shared.app.roomID;
      },
      get isConnected() {
        return shared.peers.remote.data;
      },
    };
  },
  mounted() {
    if (this.roomID === "") {
      this.$router.replace("/");
    }
    navigator.clipboard.writeText(this.roomID);
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
