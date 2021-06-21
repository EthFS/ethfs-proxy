const http = require('http')
const {ethers, utils: {arrayify, toUtf8Bytes}} = require('ethers')
const abi = require('./ethfs.abi')

http.createServer(async (req, res) => {
  try {
    const match = req.url.match(new RegExp(`/+([^/]+)/+([^/]+)(.*)`))
    let network = match[1]
    const address = match[2]
    let path = match[3]
    switch (network) {
    case 'harmony-s0':
      network = 'https://api.harmony.one'
      break
    case 'harmony-s1':
      network = 'https://s1.api.harmony.one'
      break
    }
    const provider = new ethers.providers.JsonRpcProvider(network)
    const kernel = new ethers.Contract(address, abi, provider)
    const {fileType} = await kernel.stat(toUtf8Bytes(path || '/'))
    if (fileType == 2) {
      if (path[path.length-1] !== '/') {
        return res.writeHead(301, {Location: req.url+'/'}).end()
      } else {
        path += 'index.html'
      }
    }
    let buf = Buffer.alloc(0)
    while (true) {
      const data = arrayify(await kernel.readPath(toUtf8Bytes(path), '0x', buf.length, 32768))
      buf = Buffer.concat([buf, data])
      if (data.length < 32768) break
    }
    res.end(buf)
  } catch (e) {
    res.writeHead(404).end()
  }
}).listen(3000, 'localhost')
