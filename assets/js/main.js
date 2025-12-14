import { initRouter } from "./router.js";
import { store } from "./store.js";
import { initTheme } from "./theme.js";

initTheme();
store.init();
initRouter();
