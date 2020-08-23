//scrapes all text from page and passes to background.js
var toxicityScore = 0;
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "clicked_browser_action") {
            var textNodes = getTextNodes($("body"));
            var text = [];
            
            textNodes.each(function() {
              text.push($(this).text());
            });

            chrome.runtime.sendMessage({"message": "analyze_text", "text": text});
        }
        if (request.message === "data_ready") {
            var percentage = Math.round(request.score * 100);
            var additional = "That's not bad, but make sure your sources are reliable."
            if (percentage >= 50) {
                additional = "That's pretty high. Have you considered using another source?"
            }
            alert("Hey, this page has a toxicity score of about " + percentage + "%. " + additional);
        }    
        
    }
);


var getTextNodes = function(el) {
    return $(el).find(":not(iframe)").find(".visible").addBack().contents().filter(function() {
        return this.nodeType == 3 && $.trim(this.nodeValue) !== '';
    });
}

