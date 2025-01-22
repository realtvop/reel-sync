import transform from "sdp-transform";

export const transformSdp = (sdp) => {
  const parsed = transform.parse(sdp);

  parsed.media.forEach((media) => {
    if (media.type === "audio") {
      transformAudio(media);
    } else {
      transformVideo(media);
    }
  });

  return transform.write(parsed);
};

const getPayloads = (payloads, codecs) => {
  return payloads
    ?.split(" ")
    .filter((value) => codecs.includes(+value))
    .join(" ");
};

const transformAudio = (media) => {
  /*
   * 111 - opus 48000, encoding - 2
   * 103 - isac 16000
   * 63 - red 48000, encoding - 2
   */

  const audioCodecs = [111, 103, 63];

  media.payloads = getPayloads(media.payloads, audioCodecs);
  media.rtp = media.rtp.filter(({ payload }) => audioCodecs.includes(payload));
};

const transformVideo = (media) => {
  /*
   * 96 - VP8
   * 98 - VP9
   * 102 - H264
   */
  const videoCodecs = [96, 97];

  media.payloads = getPayloads(media.payloads, videoCodecs);
  media.rtp = media.rtp.filter(({ payload }) => videoCodecs.includes(payload));
  media.rtcpFb = media.rtcpFb?.filter(({ payload }) => videoCodecs.includes(payload));
  media.fmtp = media.fmtp.filter(({ config }) =>
    videoCodecs.includes(Number(config.split("=")[1])),
  );
};
