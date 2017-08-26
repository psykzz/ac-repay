'use strict';
module.exports = {
  port: 3000,
  db: {
    url: 'db',
    schema_version: 1,
  },
  auth: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callback: process.env.DISCORD_OAUTH_CALLBACK,
  }
}
