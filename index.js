const http = require('http')
const Contract = require('web3-eth-contract')
const {utf8ToHex} = require('web3-utils')

Contract.setProvider('https://api.harmony.one')

const server = http.createServer((req, res) => {
  const sp = req.url.split('/')
  const address = sp[1]
  if (!address.startsWith('0x')) return res.end()
  let path = sp.slice(2).join('/')
  if (path === '') path = '/'

  const kernel = new Contract(require('./ethfs.abi'), address)
  kernel.methods.stat(utf8ToHex(path)).call()
  .then(({fileType}) => {
    if (fileType == 2) path += '/index.html'
    return kernel.methods.readPath(utf8ToHex(path), '0x').call()
  })
  .then(data => res.end(Buffer.from(data.slice(2), 'hex')))
})

server.listen(3000, 'localhost')
