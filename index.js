const phantom = require('phantom');
const fs = require('fs');
const config = require('./config');

const url = config.url;

const ms2s = 1000;
const interval = config.interval * ms2s;

let count = 1;
function sleep(time) {
  // logger2(`sleep ${time/1000} s`)
  return new Promise(res => {
    setTimeout(function() {
      res();
    }, time);
  })
}

function logger(time, result, other) {
  try {
    let record = fs.readFileSync('log', 'utf-8');
    record += ` ${time} ${result ? '可预订' : 'no'}\n`;
    fs.writeFileSync('log', record);
  } catch(e) {
    console.log(e);
  }
}

function logger2(other) {
  try {
    let record = fs.readFileSync('log', 'utf-8');
    record += `${other}\n`;
    fs.writeFileSync('log', record);
  } catch(e) {
    console.log(e);
  }
}

async function clickTrafficBtn(page) {
  await page.evaluate(function() {
    $('#traffic_control')
      .trigger('click');
  })
}

async function locate(page) {
  await page.evaluate(function() {
    $('#sole-input').val('北京市');
    $('#search-button').trigger('click');
  })
}
async function init(page) {
  page.property('viewportSize', { width: 1280, height: 1024 });
  await locate(page);
  await sleep(2000);
  await clickTrafficBtn(page);
  await sleep(15000)
}
async function getImage(page) {
  logger2(`正在抓取第${count}张 ${new Date().toString()}`)
  page.render(`./imgs/traffic_${count}.jpeg`, {format: 'jpeg', quality: '50'});
  count ++;
  await sleep(interval);
}
async function refreshImage(page) {
  await page.evaluate(function() {
    $('#bt_trafficCtrl').trigger('click');
  })
  await sleep(15000);
}
(async function() {
    const instance = await phantom.create();
    
    let page = await instance.createPage();
    await page.on("onResourceRequested", function(requestData) {
        console.info('Requesting', requestData.url)
        // logger2(`Requesting  ${requestData.url}`)
    });
 
    const status = await page.open(url);
    console.log(status);

    await init(page);
    while(true) {
      await getImage(page);
      
      logger2(` 重新加载...`)
      await refreshImage(page);
    }

    // await instance.exit();
}());
