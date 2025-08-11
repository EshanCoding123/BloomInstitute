function getArticleText() {
   const selectors = [
    "article",
    "main",
    "section[role='main']",
    "section.content",
    "section.article",
    "section.story",
    "section.post",
    "section.entry",
    "section#main",
    "section#content",
    ".article-body",
    ".articleBody",
    ".article__body",
    ".article-content",
    ".articleContent",
    ".article_text",
    ".articleText",
    ".article-page",
    ".article-page__content",
    "wysiwyg wysiwyg--all-content",
    ".articlePage",
    ".entry-content",
    ".entryContent",
    ".entry_body",
    ".entryBody",
    ".post-content",
    ".postContent",
    ".post-body",
    ".postBody",
    ".post-entry",
    ".postEntry",
    ".story-body",
    ".storyBody",
    ".story__body",
    ".story-content",
    ".storyContent",
    ".story__content",
    ".storyText",
    ".story-text",
    ".story_page",
    ".blog-post",
    ".blogPost",
    ".blog-post-content",
    ".blogPostContent",
    ".post-article",
    ".postArticle",
    ".post-article-body",
    ".postArticleBody",
    ".content-body",
    ".contentBody",
    ".content-area",
    ".contentArea",
    ".page-content",
    ".pageContent",
    ".body-content",
    ".bodyContent",
    ".text-content",
    ".textContent",
    ".main-content",
    ".mainContent",
    "#main-content",
    "#mainContent",
    "#content",
    "#article",
    "#story",
    "#news-article",
    "#post",
    "#entry",
    "#article-body",
    "#articleBody",
    ".content-article",
    ".article-main",
    ".main-article",
    ".mainArticle",
    ".article-section",
    ".articleSection",
    ".text-article",
    ".textArticle",
    ".press-release",
    ".pressRelease",
    ".release-body",
    ".releaseBody",
    ".all-content",
    ".allContent",
    ".content",
    ".text",
    ".main-text",
    ".storytext",
    ".read__content",
    ".post-text",
    ".postText"
  ];
  //finds article text using common selectors in HTML websites. can add more if needed
  let text = "";
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const candidate = el.innerText.trim();
      if (candidate.length > 100) { // avoid grabbing navbars
        text = candidate;
        break;
      }
    }
  }
   if (!text) {
    let bestText = "";
    let bestScore = 0;
    const elements = Array.from(document.querySelectorAll("main, article, section, div"));

    for (const el of elements) {
      const candidate = el.innerText.trim();
      if (candidate.length < 100) continue; // skip tiny elements
      const linkRatio = (el.querySelectorAll("a").length / (candidate.split(/\s+/).length || 1));
      if (linkRatio > 0.3) continue; // skip likely nav/sidebars

      const wordCount = candidate.split(/\s+/).length;
      if (wordCount > bestScore) {
        bestScore = wordCount;
        bestText = candidate;
      }
    }

    if (bestText) text = bestText;
  }

  //Last resort: entire body text
  if (!text) {
    text = document.body.innerText.trim();
  }

  return text;
 
  
}

//create floating button
const button = document.createElement("button");
button.textContent = "Click to Analyze Trustworthiness of Article";
button.style.position = "fixed";
button.style.bottom = "110px";
button.style.right = "20px";
button.style.padding = "10px";
button.style.zIndex = "9999";
button.style.backgroundColor = "#4CAF50";
button.style.color = "white";
button.style.border = "none";
button.style.borderRadius = "5px";
document.body.appendChild(button);

// Create a result display element
const resultBox = document.createElement("div");
resultBox.style.position = "fixed";
resultBox.style.bottom = "150px";
resultBox.style.right = "20px";
resultBox.style.padding = "10px";
resultBox.style.backgroundColor = "#fff";
resultBox.style.border = "1px solid #ccc";
resultBox.style.borderRadius = "5px";
resultBox.style.zIndex = "9999";
document.body.appendChild(resultBox);

button.addEventListener("click", async () => {
  resultBox.innerHTML = `<div style="display:flex;align-items:center;"><span class="loader" style="margin-right:8px;"></span> <span>Analyzing...</span></div>`;
  const text = getArticleText();
  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    let data;
    let responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch (jsonErr) {
      resultBox.style.backgroundColor = "#f8d7da";
      resultBox.style.borderColor = "#dc3545";
      resultBox.innerHTML = `<div style='color:#721c24;'>Error: Could not parse server response.<br>${jsonErr}<br><pre>${responseText}</pre></div>`;
      console.error("Response parse error:", jsonErr, responseText, response);
      return;
    }
    if (!response.ok) {
      resultBox.style.backgroundColor = "#f8d7da";
      resultBox.style.borderColor = "#dc3545";
      resultBox.innerHTML = `<div style='color:#721c24;'>HTTP ${response.status}: ${response.statusText}<br><pre>${responseText}</pre></div>`;
      return;
    }
    if (data.detail) {
      resultBox.style.backgroundColor = "#f8d7da";
      resultBox.style.borderColor = "#dc3545";
      resultBox.innerHTML = `<div style='color:#721c24;'>Error: ${data.detail}</div>`;
      return;
    }
  
    //result box color for trust status 
    if(data.color === "green") {
      resultBox.style.backgroundColor = "#d4edda";
      resultBox.style.borderColor = "#28a745";
    }else if (data.color === "yellow") {
      resultBox.style.backgroundColor = "#fff3cd";
      resultBox.style.borderColor = "#ffc107";
    }else {
      resultBox.style.backgroundColor = "#f8d7da";
      resultBox.style.borderColor = "#dc3545";
    }
  
    //override with bias color if bias is present
    if (data.bias === "left") {
      resultBox.style.backgroundColor = "#e3f0fb";
      resultBox.style.borderColor = "#1976d2";
    }else if(data.bias === "right") {
      resultBox.style.backgroundColor = "#fdeaea";
      resultBox.style.borderColor = "#d32f2f";
    }else if (data.bias === "center") {
      resultBox.style.backgroundColor = "#f4f4f4";
      resultBox.style.borderColor = "#888";
    }
    const tooltips = data.tooltips || {};
    let biasColor = data.bias==="left" ?"#1976d2":(data.bias ==="right"?"#d32f2f":(data.bias=== "center" ?"#888" :"#888"));
    resultBox.innerHTML = `
      <div style="font-family:Arial,sans-serif;max-width:340px;">
        <h4 style="margin:0 0 8px 0;color:#000">Trustworthiness Result</h4>
        ${data.ai_warning ? `<div style='color:#b71c1c;font-weight:bold;margin-bottom:6px;' title="${tooltips.ai_warning || 'Warning if the article is not from a recognized reputable source.'}">⚠️ ${data.ai_warning}</div>` : ''}
        ${data.absurdity && data.absurdity.is_absurd ? `<div style='color:#b71c1c;font-weight:bold;margin-bottom:6px;' title="${tooltips.absurdity || 'Flags if the article contains highly improbable, sensational, or nonsensical claims. Confidence 0-1 rating'}">🚩 Absurdity Warning (EXPERIMENTAL): ${data.absurdity.reason || 'Content flagged as absurd.'}</div>` : ''}
        <div style="font-size:16px;color:#000;margin-bottom:4px;"><strong>Status:</strong> <span style="text-transform:capitalize;" title="${tooltips.trustworthiness || 'Status: Whether the article is classified as trustworthy or untrustworthy based on AI analysis and source checks.'}">${data.trustworthiness}</span></div>
        <div style="font-size:15px;color:#000;margin-bottom:4px;"><strong>Trust Score:</strong> <span title="${tooltips.trust_score || 'Trust Score: Confidence from the AI model that the article is real news (1 = highest confidence, 0 = lowest).'}">${typeof data.trust_score !== 'undefined' ? data.trust_score : '-'}<\/span> / 1<\/div>
        <div style="font-size:14px;color:#000;margin-bottom:4px;"><strong>Bias (Ignore if not politics related):</strong> <span style="color:${biasColor};text-transform:capitalize;" title="${tooltips.bias || 'Bias: Political leaning detected by the AI (left, center, or right). Ignore if the article is not political.'}">${data.bias}</span> <span style="font-size:12px;color:#888;" title="${tooltips.bias_score || 'Bias Score: Confidence in the detected bias (higher is more confident).'}">(${data.bias_score ?? "-"}%)<\/span><\/div>
        <div style="font-size:14px;color:#000;margin-bottom:4px;"><strong>Sentiment:</strong> <span title="${tooltips.sentiment || 'Sentiment: Overall emotional tone of the article (positive, negative, or neutral).'}">${data.sentiment}</span> <span title="${tooltips.sentiment_score || 'Sentiment Score: Confidence in the sentiment classification.'}">(${typeof data.sentiment_score !== 'undefined' ? data.sentiment_score : '-'})<\/span><\/div>
        <div style="font-size:13px;color:#666;margin-bottom:6px;"><strong>Summary (EXPERIMENTAL):</strong> <span title="${tooltips.summary || 'Summary: AI-generated summary of the article.'}">${data.summary ?? ''}<\/span><\/div>
        <div style="font-size:12px;color:#888;margin-top:8px;" title="${tooltips.privacy || 'Privacy: No sensitive user data is stored. All analysis is performed in-memory.'}">${data.privacy ?? ''}<\/div>
      <\/div>
    `;
  } catch (error) {
    resultBox.style.backgroundColor = "#f8d7da";
    resultBox.style.borderColor = "#dc3545";
    resultBox.innerHTML = `<div style='color:#721c24;'>Error analyzing article.<br>${error}</div>`;
    console.error("Fetch failed:", error);
  }
});

