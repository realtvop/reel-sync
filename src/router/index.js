import { createRouter, createWebHistory } from "vue-router";
import StartView from "../views/StartView.vue";

const router = createRouter({
  mode: "hash",
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "start",
      component: StartView,
    },
    {
      path: "/stream",
      name: "stream",
      component: () => import("../views/StreamView.vue"),
    },
    {
      path: "/:pathMatch(.*)*", // 捕获所有未定义的路径
      redirect: "/",
    },
  ],
});

export default router;
