#! /usr/bin/env node
const Koa = require('koa')
const axios = require('axios')
const cheerio = require('cheerio');

const app = new Koa()

const gtmHeader = (gid)=>{
  return `<!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','${gid}');</script>`
}

const gtmBody = (gid) => {
  return `<!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gid}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`
}

app.use(async (ctx, next)=>{
  const {source, gid} = ctx.query
  const {data} = await axios.get(source)
  const contents = cheerio.load(data)
  contents('head').prepend('\n'+gtmHeader(gid))
  contents('body').prepend('\n'+gtmBody(gid))
  ctx.body = contents.html()
  await next()
})

app.listen(8000)