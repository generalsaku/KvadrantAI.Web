import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AdministrationView from "@/views/AdministrationView.vue";
import { useUserStore } from "@/stores/user";

const requireAdministrationAccess = () => {
  const userStore = useUserStore();
  userStore.authorize();

  if (userStore.user.isAdministrator) {
    return true;
  }

  return { name: "home" };
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/administration",
      name: "administration",
      component: AdministrationView,
      beforeEnter: requireAdministrationAccess,
    },
  ],
});

export default router;
