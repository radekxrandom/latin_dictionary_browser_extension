var clickedEl = null;
var x;
var y;
var bubbleDOM = document.createElement("div");
bubbleDOM.setAttribute("class", "selection_bubble");
document.body.appendChild(bubbleDOM);

document.addEventListener(
  "contextmenu",
  function(event) {
    /*  clickedEl = event.target;
    y = event.pageY - 25;
    x = event.pageX; */
    var r = window
      .getSelection()
      .getRangeAt(0)
      .getBoundingClientRect();
    y = r.top - 120;
    x = (r.right + r.left) / 2;
    console.log(r);
  },
  true
);

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.name == "getClickedEl") {
    console.log(clickedEl);
    renderBubble(x, y, request.msg);
  }
});

const createTranslatedHtml = wordsArr => {
  let word = "";
  for (let i = 0; i < wordsArr.length; i++) {
    word = word + `<p>${i}. ${wordsArr[i]}</p>` + "\n";
  }
  return word;
};

function renderBubble(mouseX, mouseY, selection) {
  console.log(selection.translations);
  const trs = createTranslatedHtml(selection.translations);

  bubbleDOM.style.top = mouseY + "px";
  bubbleDOM.style.left = mouseX + "px";
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
}

const closeTooltip = e => {
  const tooltip = document.getElementsByClassName("selection_bubble")[0];
  tooltip.style.visibility = "hidden";
  console.log(tooltip);
};
