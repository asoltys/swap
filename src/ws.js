export default (url, cb) => {
  new WebSocket(url).onmessage = cb;
};
