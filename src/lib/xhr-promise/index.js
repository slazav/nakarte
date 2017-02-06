function successIfStatus200(xhr) {
    return xhr.status >= 200 && xhr.status <= 299;
}

function retryIfNetworkErrorOrServerError(xhr) {
    return (xhr.status === 0 || xhr.status >= 500);
}


function arrayBufferToString(arBuf) {
    const result = [];
    const arr = new Uint8Array(arBuf);
    let chunk;
    for (let i = 0; i < arr.length; i += 4096) {
        chunk = arr.subarray(i, i + 4096);
        chunk = String.fromCharCode.apply(null, chunk);
        result.push(chunk);
    }
    return result.join('');
}


class XMLHttpRequestPromise {
    constructor(
        url, {method='GET', data=null, responseType='', timeout=30000, maxTries=3, retryTimeWait=1000,
            isResponseSuccess=successIfStatus200, responseNeedsRetry=retryIfNetworkErrorOrServerError} = {}) {
        // console.log('promise constructor', url);
        const promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
            }
        );
        this.then = promise.then.bind(promise);
        this.catch = promise.catch.bind(promise);
        this.method = method;
        this.url = url;
        this.responseType = responseType;
        this.postData = data;
        this._isResponseSuccess = isResponseSuccess;
        this._responseNeedsRetry = responseNeedsRetry;
        this._retryTimeWait = retryTimeWait;
        this.triesLeft = maxTries;

        const xhr = this.xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => this._onreadystatechange();
        this._open();
        xhr.timeout = timeout;
        if (responseType === 'binarystring') {
            xhr.responseType = 'arraybuffer';
        } else {
            xhr.responseType = responseType;
        }
    }

    _open() {
        // console.log('open', this.url);
        this.xhr.open(this.method, this.url);
    }

    _onreadystatechange() {
        const xhr = this.xhr;
        if (xhr.readyState === 4 && !this._aborted) {
            // console.log('ready state 4', this.url);
            if (this.responseType === 'binarystring' && xhr.response && xhr.response.byteLength) {
                xhr.responseBinaryText = arrayBufferToString(xhr.response);
            }
            if (this._isResponseSuccess(xhr)) {
                // console.log('success', this.url);
                this._resolve(xhr);
            } else {
                if (this.triesLeft > 0 && this._responseNeedsRetry(xhr)) {
                    // console.log('retry', this.url);
                    this._open();
                    this._timerId = setTimeout(() => this.send(), this._retryTimeWait);
                } else {
                    // console.log('failed', this.url);
                    this._reject(xhr);
                }
            }
        }
    }

    abort() {
        // console.log('abort', this.url);
        this._aborted = true;
        clearTimeout(this._timerId);
        this.xhr.abort();
    }

    send() {
        // console.log('send', this.url);
        this.triesLeft -= 1;
        this.xhr.send(this.postData);
    }
}


class XHRQueue {
    constructor(maxSimultaneousRequests=6) {
        this._maxConnections = maxSimultaneousRequests;
        this._queue = [];
        this._activeCount = 0;
    }

    put(url, options) {
        const promise = new XMLHttpRequestPromise(url, options);
        promise._originalAbort = promise.abort;
        promise.abort = () => this._abortPromise(promise);
        this._queue.push(promise);
        this._processQueue();
        return promise;
    }

    _abortPromise(promise) {
        const i = this._queue.indexOf(promise);
        if (i > -1) {
            this._queue.splice(i, 1);
        } else {
            promise._originalAbort();
            this._activeCount -= 1;
            setTimeout(() => this._processQueue(), 0);
        }
    }

    _processQueue() {
        if (this._activeCount >= this._maxConnections || this._queue.length === 0) {
            return;
        }
        const promise = this._queue.shift();
        promise
            .catch(() => {})
            .then(() => this._onRequestReady(promise));
        this._activeCount += 1;
        promise.send()
    }

    _onRequestReady(promise) {
        if (!promise._aborted) {
            this._activeCount -= 1;
        }
        setTimeout(() => this._processQueue(), 0);
    }
}


function fetch(url, options) {
    // console.log('fetch', url);
    const promise = new XMLHttpRequestPromise(url, options);
    promise.send();
    return promise;
}


export {fetch, XHRQueue};
