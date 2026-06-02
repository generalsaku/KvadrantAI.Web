import { ref } from "vue";
import { defineStore } from "pinia";
import { loginUrl, logoutUrl } from "@/api/request";

const accessTokenKey = "access_token";
const administrationEmail = "josefgdev@gmail.com";

interface UserState {
  isAuthorized: boolean;
  isAdministrator: boolean;
  name: string;
  email: string;
  image: string;
}

const emptyUser = (): UserState => ({
  isAuthorized: false,
  isAdministrator: false,
  name: "",
  email: "",
  image: "",
});

export const useUserStore = defineStore("user", () => {
  const user = ref<UserState>(emptyUser());

  const authorize = () => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("access_token");

    if (tokenFromUrl) {
      localStorage.setItem(accessTokenKey, tokenFromUrl);
      window.history.replaceState({}, "", window.location.pathname);
    }

    const accessToken = localStorage.getItem(accessTokenKey);
    if (!accessToken) {
      user.value = emptyUser();
      return;
    }

    const jwt = parseJwt(accessToken);
    if (!jwt || isExpired(jwt.exp)) {
      localStorage.removeItem(accessTokenKey);
      user.value = emptyUser();
      return;
    }

    user.value = {
      isAuthorized: true,
      isAdministrator: isAdministrationUser(jwt.email),
      name: jwt.name ?? "",
      email: jwt.email ?? "",
      image: jwt.image ?? "",
    };
  };

  const signIn = () => {
    window.location.href = loginUrl(window.location.href);
  };

  const signOut = () => {
    localStorage.removeItem(accessTokenKey);
    user.value = emptyUser();
    window.location.href = logoutUrl(window.location.origin + import.meta.env.BASE_URL);
  };

  return { user, authorize, signIn, signOut };
});

interface JwtPayload {
  name?: string;
  email?: string;
  image?: string;
  exp?: number;
  userid?: string;
}

const isAdministrationUser = (email?: string) =>
  (email ?? "").toLowerCase() === administrationEmail;

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const isExpired = (exp?: number) =>
  typeof exp !== "number" || Date.now() >= exp * 1000;
