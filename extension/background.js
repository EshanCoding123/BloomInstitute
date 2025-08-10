chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getArticleText,
  }, (results) => {
    const articleText = results[0].result;

    // Send to FastAPI backend
    fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({text:articleText })
    })
      .then(res => res.json())
      .then(data => {
        alert("Trustworthiness:" + data.trustworthiness);
      })
      .catch(err => {
        alert("Error contacting API: " + err);
      });
  });
});

function getArticleText() {
  return document.body.innerText;
}
