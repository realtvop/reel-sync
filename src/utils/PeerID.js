import CryptoJS from "crypto-js";
import { msg } from "./msg";

export class PeerID {
  constructor() {
    const seq = this.generate();
    msg.d(`PeerID: ${seq}`);
    this.id.raw = seq;
    this.id.data = `${seq}-data`;
    this.id.video = `${seq}-video`;
  }
  id = {
    raw: "",
    data: "",
    video: "",
  };
  generate() {
    const randomValues = window.crypto.getRandomValues(new Uint16Array(16));
    return CryptoJS.MD5(randomValues).toString().substring(0, 16);
  }
}
