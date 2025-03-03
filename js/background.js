//console.log("At least reached background.js")

//https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function

// const types = [
//     "all",
//     "page",
//     "frame",
//     "selection",
//     "link",
//     "editable",
//     "image",
//     "video",
//     "audio",
//     "browser_action",
//     "page_action",
//     "action"
// ];

chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        'id': 'ID_REQUIRE_SHOW_VIDEO_URLS',
        'enabled': true,
        'title': 'Show video urls',
        "contexts": ["all"],
        "visible": true
    });

});

chrome.contextMenus.onClicked.addListener((clickData, tab) => {
    // console.log("tab data: ", tab);
    // console.log("menu data: ", clickData);
    if (tab.id) {
        switch (clickData.menuItemId) {
            case "ID_REQUIRE_SHOW_VIDEO_URLS":
                (async () => {
                    const response = await chrome.tabs.sendMessage(tab.id, { cmd: "REQUIRE_SHOW_VIDEO_URLS" });
                })();
                break;
        }
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        (async () => {
            // console.log(sender.tab ?
            //     "from a content script:" + sender.tab.url :
            //     "from the extension");
            switch (request.cmd) {
                case "DOUYIN_DOWNLOAD":
                    let url = 'http://127.0.0.1:3939/douyin/video/download/' + request.id;
                    //console.log("speech request from content", request);
                    await fetch(url, {
                        method: "GET",
                    })
                        .then(res => res.json())
                        .then(out => {
                            //console.log('Checkout this JSON! ', out);
                            sendResponse(out);
                        })
                        .catch(err => { throw err });
                    break;
                case "TIKTOK_DOWNLOAD":
                    let url1 = 'http://127.0.0.1:3939/tiktok/video/download/' + request.id;
                    //console.log("speech request from content", request);
                    await fetch(url1, {
                        method: "GET",
                    })
                        .then(res => res.json())
                        .then(out => {
                            //console.log('Checkout this JSON! ', out);
                            sendResponse(out);
                        })
                        .catch(err => { throw err });
                    break;
                case "DOUYIN_COOKIE":
                    let url2 = 'http://127.0.0.1:3939/douyin/cookies/update/';
                    //console.log("speech request from content", request);
                    await fetch(url2, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cookie: request.cookie, })
                    })
                        .then(res => res.json())
                        .then(out => {
                            //console.log('Checkout this JSON! ', out);
                            sendResponse(out);
                        })
                        .catch(err => { throw err });
                    break;
                case "TIKTOK_COOKIE":
                    let url3 = 'http://127.0.0.1:3939/tiktok/cookies/update/';
                    //console.log("speech request from content", request);
                    await fetch(url3, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cookie: request.cookie, })
                    })
                        .then(res => res.json())
                        .then(out => {
                            //console.log('Checkout this JSON! ', out);
                            sendResponse(out);
                        })
                        .catch(err => { throw err });
                    break;
            }
        })();
        return true;
    }
);

// setInterval(() => {
//     // display the remaining time
//     //console.log("loop in background");
//     if (readingInfo.tabId) {
//         (async () => {
//             const response = await chrome.tabs.sendMessage(readingInfo.tabId, { cmd: "continue_reading" });
//             //console.log("loop in background: ", response);
//         })();
//     }
// }, 500);