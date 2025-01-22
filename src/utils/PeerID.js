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
    return `${CryptoJS.HmacSHA1(Math.random().toString(), "whyisthisnotworking")}`.substring(0, 16);
  }
}
