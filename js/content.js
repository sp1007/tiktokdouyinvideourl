window.myreadercontroller = {
    data: {
        css: '.show-vd-url-container { display: flex; gap: 3px; align-items: center; position: absolute; left: 2px; top: 2px; z-index: 999; background-color: #efefef33; padding: 3px; border-radius: 6px;} .show-vd-url { width: 24px; height: 24px; border: none; background-color: #33333322; display: flex; justify-content: center; align-items: center; font-size: 14px; cursor: pointer; border-radius: 6px; transition: background-color 0.2s; } .show-vd-url:hover { background-color: #f0f0f055; } #show-vd-notification-container { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 10px; z-index: 9999; } .show-vd-notification { background-color: #4caf50; color: white; padding: 12px 20px; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); font-family: Arial, sans-serif; animation: showvdfadeIn 0.3s ease-in-out; min-width: 220px; } @keyframes showvdfadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
    },
    addcss: function () {
        let newCss = document.createElement('style');
        newCss.innerHTML = this.data.css;
        document.head.appendChild(newCss);
    },
    addNotificationContainer: function (message) {
        let container = document.getElementById('show-vd-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'show-vd-notification-container';
            document.body.appendChild(container);
        }
    },
    showNotification: function (message) {
        let container = document.getElementById('show-vd-notification-container');
        if (!container) {
            this.addNotificationContainer();
            container = document.getElementById('show-vd-notification-container');
        }
        let notification = document.createElement('div');
        notification.className = 'show-vd-notification';
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },
    onWindowLoaded: function () {
        //console.log("myreadercontroller loaded modified");
        //myreadercontroller.loadOptionsFromStorage();
        myreadercontroller.addcss();
        myreadercontroller.addNotificationContainer();
    },
    init: function () {
        this.processMenuCommands();
        this.cycleShowVideoUrl();
    },
    cycleShowVideoUrl: function () {
        setInterval(() => {
            // display the remaining time
            //console.log("loop in background");
            if (window.location.hostname.toLowerCase() == 'www.tiktok.com') {
                myreadercontroller.collectionTikTokVideos();
            } else {
                myreadercontroller.collectVideos();
            }
        }, 1000);
    },
    processMenuCommands: function () {
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                (() => {
                    let obj = window.myreadercontroller;
                    // console.log(sender.tab ?
                    //     "from a content script:" + sender.tab.url :
                    //     "from the extension: " + request.cmd);
                    switch (request.cmd) {
                        case "REQUIRE_SHOW_VIDEO_URLS":
                            //console.log("REQUIRE_SHOW_VIDEO_URLS");
                            if (window.location.hostname.toLowerCase() == 'www.tiktok.com') {
                                myreadercontroller.collectionTikTokVideos();
                            } else {
                                myreadercontroller.collectVideos();
                            }
                            sendResponse({ ping: "REQUIRE_SHOW_VIDEO_URLS" }); //to background
                            break;
                    }
                })();
                return true;
            }
        );
    },
    extractRegexMatches: function (inputString, regexPattern) {
        // Ensure the regex pattern has the global flag to find all matches
        const regex = new RegExp(regexPattern, 'g');
        let matches = [];
        let match;

        // Use the exec method to find all matches
        while ((match = regex.exec(inputString)) !== null) {
            matches.push(match[1]);
        }

        return matches;
    },
    collectionTikTokVideos: function () {
        this.tiktok_search_videos();
        this.tiktok_recommended_videos();
        this.tiktok_detail_video();
        this.tiktok_flying_video();
        this.tiktok_explore_videos();
    },
    tiktok_explore_videos: function () {
        let rtags = document.querySelectorAll('[data-e2e="explore-item"]');
        if (rtags && rtags.length > 0) {
            console.log("tiktok_explore_videos", rtags);
            for (let i = 0; i < rtags.length; i++) {
                rtags[i].parentElement.style.position = 'relative';
                let a = rtags[i].querySelector('a[href*="/video/"]');
                let id = this.extractRegexMatches(a.getAttribute('href'), '/video/(\\d+)');
                this.addButtons(rtags[i].parentElement,
                    oncopy = () => {
                        navigator.clipboard.writeText(a.getAttribute('href'));
                        myreadercontroller.showNotification('Copied ' + a.getAttribute('href'));
                    },
                    onDownload = () => {
                        (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                            })();
                            //alert('Sent to download: ' + id);
                            myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = true
                );
            }
        }
    },
    tiktok_flying_video: function(){
        let rtags = document.querySelectorAll('[data-e2e="browse-video"]');
        if (rtags && rtags.length > 0) {
            for (let i = 0; i < rtags.length; i++) {
                this.addButtons(rtags[i],
                    oncopy = () => {
                        let id = myreadercontroller.extractRegexMatches(window.location.href, '/\@.+/video/(\\d+)');
                        let auth = myreadercontroller.extractRegexMatches(window.location.href, '/\@(.+)/video/\\d+');
                        navigator.clipboard.writeText('https://www.tiktok.com/@' + auth + '/video/' + id);
                        myreadercontroller.showNotification('Copied ' + 'https://www.tiktok.com/@' + auth + '/video/' + id);
                    },
                    onDownload = () => {
                        let id = myreadercontroller.extractRegexMatches(window.location.href, '/\@.+/video/(\\d+)');
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                        })();
                        //alert('Sent to download: ' + id);
                        myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = true
                );
            }
        }
    },
    tiktok_search_videos: function(){
        let search_container = document.getElementById('main-content-general_search');
        if (search_container) {
            let vtags = document.querySelectorAll('div[data-e2e="search_top-item"]');
            if (vtags && vtags.length > 0) {
                for (let i = 0; i < vtags.length; i++) {
                    let a = vtags[i].querySelector('a[href*="/video/"]');
                    let id = this.extractRegexMatches(a.getAttribute('href'), '/video/(\\d+)');
                    this.addButtons(vtags[i],
                        oncopy = () => {
                            navigator.clipboard.writeText(a.getAttribute('href'));
                            myreadercontroller.showNotification('Copied ' + a.getAttribute('href'));
                        },
                        onDownload = () => {
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                            })();
                            //alert('Sent to download: ' + id);
                            myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                        },
                        tiktok = true
                    );
                }
            }
        }
    },
    tiktok_recommended_videos: function(){
        let rtags = document.querySelectorAll('[data-e2e="recommend-list-item-container"]');
        if (rtags && rtags.length > 0) {
            for (let i = 0; i < rtags.length; i++) {
                this.addButtons(rtags[i],
                    oncopy = () => {
                        let authTag = rtags[i].querySelector('[data-e2e="video-author-uniqueid"]');
                        let idTag = rtags[i].querySelector('div[id*="xgwrapper"]');
                        let id = myreadercontroller.extractRegexMatches(idTag.getAttribute('id'), 'xgwrapper\-\\d+\-(\\d+)');
                        navigator.clipboard.writeText('https://www.tiktok.com/@' + authTag.textContent.trim() + '/video/' + id);
                        myreadercontroller.showNotification('Copied ' + 'https://www.tiktok.com/@' + authTag.textContent.trim() + '/video/' + id);
                    },
                    onDownload = () => {
                        let idTag = rtags[i].querySelector('div[id*="xgwrapper"]');
                        let id = myreadercontroller.extractRegexMatches(idTag.getAttribute('id'), 'xgwrapper\-\\d+\-(\\d+)');
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                        })();
                        //alert('Sent to download: ' + id);
                        myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = true
                );
            }
        }
    },
    tiktok_detail_video: function(){
        let detail_container = document.getElementById('main-content-video_detail');
        if (detail_container) {
            detail_container.style.position = 'relative';
            this.addButtons(detail_container,
                oncopy = () => {
                    let url = window.location.href;
                    navigator.clipboard.writeText(url);
                    myreadercontroller.showNotification('Copied ' + url);
                },
                onDownload = () => {
                    let id = myreadercontroller.extractRegexMatches(window.location.href, '/\@.+/video/(\\d+)');
                    (async () => {
                        const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                    })();
                    //alert('Sent to download: ' + id);
                    myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                },
                tiktok = true
            );
        }
    },
    collectVideos: function () {
        this.douyin_search_video();
        this.douyin_recommend_videos();
        this.douyin_video_detail();
    },
    douyin_recommend_videos: function(){
        let rtags = document.querySelectorAll('div[data-e2e^="feed-"][data-e2e$="-video"]');
        if (rtags && rtags.length > 0) {
            for (let i = 0; i < rtags.length; i++) {
                this.addButtons(rtags[i],
                    oncopy = () => {
                        let id = rtags[i].getAttribute('data-e2e-vid');
                        navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        myreadercontroller.showNotification('Copied ' + 'https://www.douyin.com/video/' + id);
                    },
                    onDownload = () => {
                        let id = rtags[i].getAttribute('data-e2e-vid');
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_DOWNLOAD', id: id });
                        })();
                        //alert('Sent to download: ' + id);
                        myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = false
                );
            }
        }
    },
    douyin_search_video: function(){
        let vtags = document.querySelectorAll('[id*="waterfall_item_"]');
        if (vtags && vtags.length > 0) {
            for (let i = 0; i < vtags.length; i++) {
                let id = vtags[i].getAttribute('id').replace('waterfall_item_', '');
                this.addButtons(vtags[i],
                    oncopy = () => {
                        navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        myreadercontroller.showNotification('Copied ' + 'https://www.douyin.com/video/' + id);
                    },
                    onDownload = () => {
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_DOWNLOAD', id: id });
                        })();
                        //alert('Sent to download: ' + id);
                        myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = false
                );
            }
        }
    },
    douyin_video_detail: function(){
        let dtags = document.querySelectorAll('div[data-e2e="video-detail"]');
        if (dtags && dtags.length > 0) {
            for (let i = 0; i < dtags.length; i++) {
                this.addButtons(dtags[i],
                    oncopy = () => {
                        navigator.clipboard.writeText(window.location.href);
                        myreadercontroller.showNotification('Copied ' + window.location.href);
                    },
                    onDownload = () => {
                        let id = myreadercontroller.extractRegexMatches(window.location.href, '/video/(\\d+)');
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_DOWNLOAD', id: id });
                        })();
                        //alert('Sent to download: ' + id);
                        myreadercontroller.showNotification('Đã đưa video vào danh sách download với ID: ' + id);
                    },
                    tiktok = false
                );
            }
        }
    },
    addButtons: function (el, onCopy, onDownload, tiktok = false) {
        if (el) {
            let existedBtn = el.querySelector('div[class="show-vd-url-container"]');
            if (!existedBtn) {
                let container = document.createElement('div');
                container.className = 'show-vd-url-container';
                let cookieBtn = document.createElement('button');
                cookieBtn.className = 'show-vd-url cookie-button';
                cookieBtn.innerHTML = '🍪';
                cookieBtn.title = 'Update cookies to downloader';
                cookieBtn.onclick = () => {
                    (async () => {
                        if (tiktok) {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_COOKIE', cookie: document.cookie });
                        } else {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_COOKIE', cookie: document.cookie });
                        }
                    })();
                    //alert('Updated cookie!');
                    myreadercontroller.showNotification('Đã cập nhật cookie!');
                };
                container.appendChild(cookieBtn);
                let copyBtn = document.createElement('button');
                copyBtn.className = 'show-vd-url copy-button';
                copyBtn.innerHTML = '📋';
                copyBtn.title = 'Copy video URL';
                copyBtn.onclick = onCopy;
                container.appendChild(copyBtn);
                let downloadBtn = document.createElement('button');
                downloadBtn.className = 'show-vd-url download-button';
                downloadBtn.innerHTML = '⬇️';
                downloadBtn.title = 'Send video URL to downloader';
                downloadBtn.onclick = onDownload;
                container.appendChild(downloadBtn);
                
                el.appendChild(container);
            }
        }
    },
};

window.addEventListener("load", myreadercontroller.onWindowLoaded);
myreadercontroller.init();
//myreadercontroller.testProxy();