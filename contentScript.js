let x;
let y;
const bubbleDOM = document.createElement("div");
bubbleDOM.setAttribute("class", "selection_bubble");
const xpkej = document.createElement("div");
document.body.appendChild(bubbleDOM);

document.addEventListener(
  "contextmenu",
  event => {
    const r = window
      .getSelection()
      .getRangeAt(0)
      .getBoundingClientRect();
    y = r.top + window.scrollY;
    x = (r.right + r.left) / 2 + window.scrollX;
    x -= r.width * 0.2;
    console.log(r);
  },
  true
);

const closeTooltip = e => {
  const tooltip = document.getElementsByClassName("selection_bubble")[0];
  tooltip.classList.remove("shown");
  bubbleDOM.style.marginTop = "unset";
  const element = document.getElementById("transTip");
  bubbleDOM.removeChild(element);
  tooltip.className = "selection_bubble";
  console.log(tooltip);
};

const createTranslatedHtml = wordsArr => {
  console.log(wordsArr);
  const translations = document.createElement("div");
  translations.setAttribute("class", "translations");
  for (let i = 0; i < wordsArr.length; i++) {
    const get = document.createElement("p");
    get.append(`${i}. ${wordsArr[i]}`);
    translations.append(get);
  }
  return translations;
};

const populateToltip = (arr, tooltip) => {
  console.log(arr);

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].title) {
      const segment = document.createElement("div");
      segment.setAttribute("class", "segment");
      const latin_word = document.createElement("div");
      latin_word.setAttribute("class", "latin_word");
      latin_word.append(arr[i].title);
      segment.append(latin_word);
      const words = createTranslatedHtml(arr[i].words);
      segment.append(words);
      tooltip.append(segment);
    } else {
      const words = createTranslatedHtml(arr[i].words);
      tooltip.append(words);
    }
  }
  return tooltip;
};

const closeOnClickOutside = e => {
  const tooltip = document.getElementById("transTip");
  const closeBtn = document.getElementById("closebtn");
  const checkTooltip = tooltip.contains(e.target);
  const checkBtn = closeBtn.contains(e.target);
  if (!checkTooltip || checkBtn) {
    closeTooltip();
  }
};

const generateTooltip = content => {
  const transTooltip = document.createElement("div");
  transTooltip.setAttribute("class", "translationTooltip");
  transTooltip.setAttribute("id", "transTip");
  const latin_word = document.createElement("div");
  latin_word.setAttribute("class", "latin_word");
  latin_word.append(content.latinWord);
  const closebtn = document.createElement("span");
  closebtn.setAttribute("id", "closebtn");
  closebtn.append("x");
  latin_word.append(closebtn);
  transTooltip.append(latin_word);
  const translations = populateToltip(content.translations, transTooltip);
  //transTooltip.append(latin_word);
  //transTooltip.append(translations);
  console.log(translations);
  return translations;
};

const renderBubble = (x, y, selection) => {
  bubbleDOM.style.background = "#f1f1f1";
  bubbleDOM.classList.add("shown");
  const transTooltip = generateTooltip(selection);
  bubbleDOM.append(transTooltip);

  const dimensions = bubbleDOM.getBoundingClientRect();

  if (
    dimensions.width + x >=
    (window.innerWidth || document.documentElement.clientWidth)
  ) {
    bubbleDOM.style.left = x - dimensions.width + "px";
  } else {
    bubbleDOM.style.left = x + "px";
  }

  if (y - dimensions.height - window.scrollY < 20) {
    bubbleDOM.style.top = y + "px";
    bubbleDOM.style.marginTop = "1em";
    bubbleDOM.classList.add("arrow_top");
  } else {
    bubbleDOM.style.top = y - dimensions.height + "px";
    bubbleDOM.style.marginTop = "-1em";
    bubbleDOM.classList.add("arrow_bottom");
  }

  document.addEventListener("click", closeOnClickOutside);
};

const adjustModalForPdf = () => {
  console.log("pach");
  bubbleDOM.style.top = "30%";
  bubbleDOM.style.left = "50%";
  bubbleDOM.style.transform = "translate(-50%, 0%)";
  bubbleDOM.style.position = "fixed";
  bubbleDOM.style.zIndex = "10";
};

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.name === "showTooltip") {
    const pdfRegex = /^.*\.(doc|DOC|pdf|PDF)$/;
    const path = window.location.pathname;
    const isPdf = pdfRegex.test(path);
    renderBubble(x, y, request.translated);
    isPdf && adjustModalForPdf();
  }
});
