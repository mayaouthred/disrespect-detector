
//content.js sends back the text
//background calls perspective (using ajax??) and does analysis with the response
//returns information to content, which then does a little popup or something

//sends alert to content.js that the icon has been clicked
//sends a message to active tab when browser action clicked
var APIkey = "AIzaSyBzgakE078GXiMA-v_g1mLXDBJXU4cbdSA";
var globalScore = 0; 

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action"});
    });
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === "analyze_text") {
            //make requests to perspective api
            console.log("analyzetext");
            makePerspectiveRequest(request.text, sendData);
        } 
        if (request.message === "popup_waiting") {
            sendResponse("hello");
        }
    }
);

var combineStrings = function(strArray) {
    //takes a string array and formats
    var combinedText = "";
    
    strArray.forEach(function(str) {
        if ((combinedText.length + str.length) < 20000) {
            combinedText += str;
        }
    });
    return combinedText;
};

var makePerspectiveRequest = function(strArray, callback) {

    var str = combineStrings(strArray);

    //takes an individual string, returns its toxicity value
    $.ajax({
        data: JSON.stringify({
            comment: {
                text: str
            },
            languages: ["en"],
            requestedAttributes: {
                "TOXICITY": {}
            }
        }),
        type: 'post',
        url: "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyBzgakE078GXiMA-v_g1mLXDBJXU4cbdSA",
        success: function(response) {
            var score = response.attributeScores["TOXICITY"].summaryScore.value;
            callback(score);
        },
        error: function(e) {
            console.log(e);
        },
        contentType: "application/json",
        dataType: 'json'
    
    });
};

var sendData = function(score) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": "data_ready", "score": score});
    });
}





