/*jshint node:true */
'use strict';

var config = {};

if (process.env.NODE_ENV === 'production') {
  config = {
    ip: process.env.IP || undefined,
    port: process.env.PORT || process.env.SERVER_PORT || 3000,
    uri: 'mongodb://omnigraph:jGSAfs2AxzSfUBcdGOpy_IbAvI.7PE9y8P74a_lDzSg-@ds030817.mongolab.com:30817/omnigraph'
  };
} else {
  config = {
    ip: undefined,
    port: 3000,
    uri: 'mongodb://localhost/omnigrahm'
  };
}

module.exports = config;