window.myreadercontroller = {
    data: {
        css: '.show-vd-url-container { display: flex; gap: 3px; align-items: center; position: absolute; left: 2px; top: 2px; z-index: 999; background-color: #efefef33; padding: 3px; border-radius: 6px;} .show-vd-url { width: 24px; height: 24px; border: none; background-color: #33333322; display: flex; justify-content: center; align-items: center; font-size: 14px; cursor: pointer; border-radius: 6px; transition: background-color 0.2s; } .show-vd-url:hover { background-color: #f0f0f055; }',
    },
    addcss: function () {
        let newCss = document.createElement('style');
        newCss.innerHTML = this.data.css;
        document.head.appendChild(newCss);
    },
    onWindowLoaded: function () {
        //console.log("myreadercontroller loaded modified");
        //myreadercontroller.loadOptionsFromStorage();
        myreadercontroller.addcss();
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
        let search_container = document.getElementById('main-content-general_search');
        if (search_container) {
            let vtags = document.querySelectorAll('div[data-e2e="search_top-item"]');
            if (vtags && vtags.length > 0) {
                for (let i = 0; i < vtags.length; i++) {
                    //console.log(i, vtags[i]);
                    let existedBtn = vtags[i].querySelector('div[class="show-vd-url-container"]');
                    if (!existedBtn) {
                        let a = vtags[i].querySelector('a[href*="/video/"]');
                        let id = this.extractRegexMatches(a.getAttribute('href'), '/video/(\\d+)');
                        let container = document.createElement('div');
                        container.className = 'show-vd-url-container';
                        let copyBtn = document.createElement('button');
                        copyBtn.className = 'show-vd-url copy-button';
                        copyBtn.innerHTML = '📋';
                        copyBtn.title = 'Copy video URL';
                        copyBtn.onclick = () => {
                            navigator.clipboard.writeText(a.getAttribute('href'));
                        };
                        container.appendChild(copyBtn);
                        let downloadBtn = document.createElement('button');
                        downloadBtn.className = 'show-vd-url download-button';
                        downloadBtn.innerHTML = '⬇️';
                        downloadBtn.title = 'Send video URL to downloader';
                        downloadBtn.onclick = () => {
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                            })();
                            alert('Sent to download: ' + id);
                        };
                        container.appendChild(downloadBtn);
                        let cookieBtn = document.createElement('button');
                        cookieBtn.className = 'show-vd-url cookie-button';
                        cookieBtn.innerHTML = '🍪';
                        cookieBtn.title = 'Update cookies to downloader';
                        cookieBtn.onclick = () => {
                            //navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                            //console.log(newBtn.getAttribute('vid'));
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_COOKIE', cookie: document.cookie });
                            })();
                            alert('Updated cookie!');
                        };
                        container.appendChild(cookieBtn);
                        vtags[i].appendChild(container);
                    }
                }
            }
        } else {
            let rtags = document.querySelectorAll('[data-e2e="recommend-list-item-container"]');
            if (rtags && rtags.length > 0) {
                for (let i = 0; i < rtags.length; i++) {
                    let existedBtn = rtags[i].querySelector('div[class="show-vd-url-container"]');
                    if (!existedBtn) {
                        //let a = rtags[i].querySelector('a[href*="/video/"]');
                        //let id = '1'; //this.extractRegexMatches(a.getAttribute('href'), '/video/(\\d+)');
                        let container = document.createElement('div');
                        container.className = 'show-vd-url-container';
                        let copyBtn = document.createElement('button');
                        copyBtn.className = 'show-vd-url copy-button';
                        copyBtn.innerHTML = '📋';
                        copyBtn.title = 'Copy video URL';
                        copyBtn.onclick = () => {
                            //navigator.clipboard.writeText(a.getAttribute('href'));
                            let authTag = rtags[i].querySelector('[data-e2e="video-author-uniqueid"]');
                            let idTag = rtags[i].querySelector('div[id*="xgwrapper"]');
                            let id = myreadercontroller.extractRegexMatches(idTag.getAttribute('id'), 'xgwrapper\-\\d+\-(\\d+)');
                            navigator.clipboard.writeText('https://www.tiktok.com/@' + authTag.textContent.trim() + '/video/' + id);
                        };
                        container.appendChild(copyBtn);
                        let downloadBtn = document.createElement('button');
                        downloadBtn.className = 'show-vd-url download-button';
                        downloadBtn.innerHTML = '⬇️';
                        downloadBtn.title = 'Send video URL to downloader';
                        downloadBtn.onclick = () => {
                            let idTag = rtags[i].querySelector('div[id*="xgwrapper"]');
                            let id = myreadercontroller.extractRegexMatches(idTag.getAttribute('id'), 'xgwrapper\-\\d+\-(\\d+)');
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                            })();
                            alert('Sent to download: ' + id);
                        };
                        container.appendChild(downloadBtn);
                        let cookieBtn = document.createElement('button');
                        cookieBtn.className = 'show-vd-url cookie-button';
                        cookieBtn.innerHTML = '🍪';
                        cookieBtn.title = 'Update cookies to downloader';
                        cookieBtn.onclick = () => {
                            //navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                            //console.log(newBtn.getAttribute('vid'));
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_COOKIE', cookie: document.cookie });
                            })();
                            alert('Updated cookie!');
                        };
                        container.appendChild(cookieBtn);

                        rtags[i].appendChild(container);
                    }
                }
            } else {
                let detail_container = document.getElementById('main-content-video_detail');
                if (detail_container) {
                    let existedBtn = detail_container.querySelector('div[class="show-vd-url-container"]');
                    if (!existedBtn) {
                        detail_container.style.position = 'relative';
                        let container = document.createElement('div');
                        container.className = 'show-vd-url-container';
                        let copyBtn = document.createElement('button');
                        copyBtn.className = 'show-vd-url copy-button';
                        copyBtn.innerHTML = '📋';
                        copyBtn.title = 'Copy video URL';
                        copyBtn.onclick = () => {
                            //navigator.clipboard.writeText(a.getAttribute('href'));
                            let url = window.location.href;
                            navigator.clipboard.writeText(url);
                        };
                        container.appendChild(copyBtn);
                        let downloadBtn = document.createElement('button');
                        downloadBtn.className = 'show-vd-url download-button';
                        downloadBtn.innerHTML = '⬇️';
                        downloadBtn.title = 'Send video URL to downloader';
                        downloadBtn.onclick = () => {
                            let id = myreadercontroller.extractRegexMatches(window.location.href, '/\@.+/video/(\\d+)');
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_DOWNLOAD', id: id });
                            })();
                            alert('Sent to download: ' + id);
                        };
                        container.appendChild(downloadBtn);
                        let cookieBtn = document.createElement('button');
                        cookieBtn.className = 'show-vd-url cookie-button';
                        cookieBtn.innerHTML = '🍪';
                        cookieBtn.title = 'Update cookies to downloader';
                        cookieBtn.onclick = () => {
                            //navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                            //console.log(newBtn.getAttribute('vid'));
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'TIKTOK_COOKIE', cookie: document.cookie });
                            })();
                            alert('Updated cookie!');
                        };
                        container.appendChild(cookieBtn);

                        detail_container.appendChild(container);
                    }
                }
            }
        }
    },
    collectVideos: function () {
        let vtags = document.querySelectorAll('[id*="waterfall_item_"]');
        if (vtags && vtags.length > 0) {
            for (let i = 0; i < vtags.length; i++) {
                //console.log(i, vtags[i]);
                let existedBtn = vtags[i].querySelector('div[class="show-vd-url-container"]');
                if (!existedBtn) {
                    let id = vtags[i].getAttribute('id').replace('waterfall_item_', '');
                    let container = document.createElement('div');
                    container.className = 'show-vd-url-container';
                    let copyBtn = document.createElement('button');
                    copyBtn.className = 'show-vd-url copy-button';
                    copyBtn.innerHTML = '📋';
                    copyBtn.title = 'Copy video URL';
                    copyBtn.onclick = () => {
                        navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        //console.log(newBtn.getAttribute('vid'));
                    };
                    container.appendChild(copyBtn);
                    let downloadBtn = document.createElement('button');
                    downloadBtn.className = 'show-vd-url download-button';
                    downloadBtn.innerHTML = '⬇️';
                    downloadBtn.title = 'Send video URL to downloader';
                    downloadBtn.onclick = () => {
                        //navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        //console.log(newBtn.getAttribute('vid'));
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_DOWNLOAD', id: id });
                        })();
                        alert('Sent to download: ' + id);
                    };
                    container.appendChild(downloadBtn);
                    let cookieBtn = document.createElement('button');
                    cookieBtn.className = 'show-vd-url cookie-button';
                    cookieBtn.innerHTML = '🍪';
                    cookieBtn.title = 'Update cookies to downloader';
                    cookieBtn.onclick = () => {
                        //navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        //console.log(newBtn.getAttribute('vid'));
                        (async () => {
                            const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_COOKIE', cookie: document.cookie });
                        })();
                        alert('Updated cookie!');
                    };
                    container.appendChild(cookieBtn);
                    vtags[i].appendChild(container);
                }
            }
        } 
        
        let rtags = document.querySelectorAll('div[data-e2e$="-video"]');
            if (rtags && rtags.length > 0) {
                for (let i = 0; i < rtags.length; i++) {
                    let existedBtn = rtags[i].querySelector('div[class="show-vd-url-container"]');
                    if (!existedBtn) {
                        let container = document.createElement('div');
                        container.className = 'show-vd-url-container';
                        let copyBtn = document.createElement('button');
                        copyBtn.className = 'show-vd-url copy-button';
                        copyBtn.innerHTML = '📋';
                        copyBtn.title = 'Copy video URL';
                        copyBtn.onclick = () => {
                            let id = rtags[i].getAttribute('data-e2e-vid');
                            navigator.clipboard.writeText('https://www.douyin.com/video/' + id);
                        };
                        container.appendChild(copyBtn);
                        let downloadBtn = document.createElement('button');
                        downloadBtn.className = 'show-vd-url download-button';
                        downloadBtn.innerHTML = '⬇️';
                        downloadBtn.title = 'Send video URL to downloader';
                        downloadBtn.onclick = () => {
                            let id = rtags[i].getAttribute('data-e2e-vid');
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_DOWNLOAD', id: id });
                            })();
                            alert('Sent to download: ' + id);
                        };
                        container.appendChild(downloadBtn);
                        let cookieBtn = document.createElement('button');
                        cookieBtn.className = 'show-vd-url cookie-button';
                        cookieBtn.innerHTML = '🍪';
                        cookieBtn.title = 'Update cookies to downloader';
                        cookieBtn.onclick = () => {
                            (async () => {
                                const res1 = await chrome.runtime.sendMessage({ cmd: 'DOUYIN_COOKIE', cookie: document.cookie });
                            })();
                            alert('Updated cookie!');
                        };
                        container.appendChild(cookieBtn);
                        rtags[i].appendChild(container);
                    }
                }
                
            }

    },
};

window.addEventListener("load", myreadercontroller.onWindowLoaded);
myreadercontroller.init();
//myreadercontroller.testProxy();