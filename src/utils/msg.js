export const msg = {
  i: (content) => {
    console.log(`[ReelSync] %c(info)%c ${content}`, "color: #2196F3", "color: inherit");
  },
  w: (content) => {
    console.log(`[ReelSync] %c(warn)%c ${content}`, "color: #FFC107", "color: inherit");
  },
  e: (content) => {
    console.log(`[ReelSync] %c(error)%c ${content}`, "color: #F44336", "color: inherit");
  },
  d: (content) => {
    console.log(`[ReelSync] %c(debug)%c ${content}`, "color: #009688", "color: inherit");
  },
};
