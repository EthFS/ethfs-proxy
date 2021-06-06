const http = require('http')
const Contract = require('web3-eth-contract')
const {utf8ToHex} = require('web3-utils')

Contract.setProvider('https://api.harmony.one')

http.createServer(async (req, res) => {
  try {
    let index = req.url.indexOf('/', 1)
    if (index < 0) index = req.url.length
    const address = req.url.slice(1, index)
    let path = req.url.slice(index)
    const kernel = new Contract(require('./ethfs.abi'), address)
    const {fileType} = await kernel.methods.stat(utf8ToHex(path || '/')).call()
    if (fileType == 2) {
      if (path[path.length-1] !== '/') {
        return res.writeHead(301, {Location: req.url+'/'}).end()
      } else {
        path += 'index.html'
      }
    }
    const data = await kernel.methods.readPath(utf8ToHex(path), '0x').call()
    res.end(Buffer.from(data.slice(2), 'hex'))
  } catch (e) {
    res.writeHead(404).end()
  }
}).listen(3000, 'localhost')
