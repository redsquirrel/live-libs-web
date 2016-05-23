'use strict';

var fs = require('fs');

var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

var LiveLibs = require('live-libs');
var liveLibs = new LiveLibs(web3, true);

var buildDir = './build';

function ensureBuildDirectory() {
  if (!fs.existsSync(buildDir))
    fs.mkdirSync(buildDir);
}

function writeIndexPage(libNames) {
  var indexPage = '<h1>Live Libs for '+liveLibs.env+'</h1>\n<ul>\n';
  libNames.forEach(function(libName) {
    indexPage += '<li><a href="'+libName+'.html">'+libName+'</a></li>\n';
  });
  indexPage += '</ul>';

  fs.writeFileSync(buildDir+'/index.html', indexPage);
  console.log('Built index page');
}

function writeVersionPage(libName, events, versionInfos) {
  var page = '<h1>'+libName+'</h1>\n';

  page += '<ul>\n';
  events.forEach(function(event) {
    page += '<li>'+event.type+'</li>\n'
  });
  page += '</ul>\n';

  fs.writeFileSync(buildDir+'/'+libName+'.html', page);
  console.log('Built '+libName+'.html');
}

var libNames = liveLibs.allNames();
var sortedLibNames = libNames.sort(function(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});

var libPagesPromises = [];
var libPagesData = [];

sortedLibNames.forEach(function(libName) {
  var promise = liveLibs.log(libName).then(function(events) {
    libPagesData.push({events: events, libName: libName});
  });

  libPagesPromises.push(promise);
});

ensureBuildDirectory();
writeIndexPage(sortedLibNames);

Promise.all(libPagesPromises).then(function() {
  libPagesData.forEach(function(data) {
    var libName = data.libName;
    var versions = liveLibs.allVersionsFor(libName);
    var versionInfos = versions.map(function(version) {
      return liveLibs.get(libName, version);
    });
    writeVersionPage(libName, data.events, versionInfos);
  });
  
}).catch(function(err) {
  console.log(err);
});
