#! /usr/bin/env node
const Koa = require('koa')
const bodyParser = require('koa-bodyparser');

const axios = require('axios')
const cheerio = require('cheerio');

const app = new Koa()
app.use(bodyParser())

const gtmHeader = (gid)=>{
  return `<!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','${gid}');</script>`
}

const gtmBody = (gid) => {
  return `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gid}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`
}

let serviceProvider

app.use(async (ctx, next)=>{
  const {source, gid} = ctx.query
  if (source) {
    ctx.headers.host = source
    serviceProvider = source
    const url = 'https://' + source + ctx.path
    const {data, headers} = await axios.get(url, {headers: ctx.headers})
    ctx.response.headers = headers
    const contents = cheerio.load(data)
    contents('head').prepend('\n'+gtmHeader(gid))
    contents('body').prepend('\n'+gtmBody(gid))
    ctx.body = contents.html()
  } else {
    if (serviceProvider) {
      const url = 'https://' + serviceProvider + ctx.path
      ctx.headers.host = serviceProvider
      const {data} = await axios.post(url, ctx.request.body, {headers: ctx.headers})
      ctx.body = data
    }
  
  }
  await next()
})

app.listen(9000)