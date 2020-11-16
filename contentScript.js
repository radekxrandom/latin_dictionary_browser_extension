let x;
let y;
let bubbleDOM = document.createElement("div");
bubbleDOM.setAttribute("class", "selection_bubble");
document.body.appendChild(bubbleDOM);

document.addEventListener(
  "contextmenu",
  event => {
    let r = window
      .getSelection()
      .getRangeAt(0)
      .getBoundingClientRect();
    y = r.top - 150;
    x = (r.right + r.left) / 2;
  },
  true
);

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.name === "showTooltip") {
    renderBubble(x, y, request.translated);
  }
});

const createTranslatedHtml = wordsArr => {
  let word = "";
  for (let i = 0; i < wordsArr.length; i++) {
    word = word + `<p>${i}. ${wordsArr[i]}</p>` + "\n";
  }
  return word;
};

const renderBubble = (x, y, selection) => {
  const trs = createTranslatedHtml(selection.translations);

  bubbleDOM.style.top = y + "px";
  bubbleDOM.style.left = x + "px";
  bubbleDOM.style.padding = "0.4rem";
  bubbleDOM.style.background = "gainsboro";
  bubbleDOM.style.visibility = "visible";
  bubbleDOM.innerHTML = `
  <div class='tooltip'>
    <div class='latin_word'>${selection.latinWord} <span id="closebtn">[x]</span></div>
    <div class='translations'>${trs}</div>
  </div>
  `;
  document.getElementById("closebtn").addEventListener("click", closeTooltip);
};

const closeTooltip = e => {
  const tooltip = document.getElementsByClassName("selection_bubble")[0];
  tooltip.style.visibility = "hidden";
  console.log(tooltip);
};
