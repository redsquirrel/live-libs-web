var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://0.0.0.0:8545'));

var LiveLibs = require('live-libs');
var liveLibs = new LiveLibs(web3, true);

function linkToLib(libName) {
  return '<a href="'+libName+'">'+libName+'</a>\n';
}

function versionToPage(libName, events, versionInfos) {
  var html = '<h1>'+libName+'</h1>\n';

  html += '<ul>\n';
  events.forEach(function(event) {
    html += '<li>'+event.type+'</li>\n'
  });
  html += '</ul>\n';
  return html;
}

var libNames = liveLibs.allNames();
var sortedLibNames = libNames.sort(function(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
});

var indexPage = '';
var libPages = [];

var libPagesPromises = [];
var libPagesData = [];

sortedLibNames.forEach(function(libName) {
  indexPage += linkToLib(libName);

  var promise = liveLibs.log(libName).then(function(events) {
    libPagesData.push({events: events, libName: libName});
    // console.log('Pulled logs for '+libName);
  });

  libPagesPromises.push(promise);
});

Promise.all(libPagesPromises).then(function() {
  libPagesData.forEach(function(data) {
    var libName = data.libName;
    var versions = liveLibs.allVersionsFor(libName);
    var versionInfos = versions.map(function(version) {
      return liveLibs.get(libName, version);
    });
    libPages.push(versionToPage(libName, data.events, versionInfos));
  });

  console.log(indexPage);
  
  libPages.forEach(function(page) {
    console.log('\n');
    console.log(page);
  });

}).catch(function(err) {
  console.log(err);
});
