import injectScript from "../../public/inject?script&module";
const script = document.createElement("script");
script.src = chrome.runtime.getURL(injectScript);
script.type = "module";
document.head.prepend(script);
