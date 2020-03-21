//* Imports
const { get } = require('powercord/http');
const { Plugin } = require('powercord/entities');
const { messages, channels } = require('powercord/webpack');
// Try to import pc-spotify
let SpotifyPlayer;
try {
  SpotifyPlayer = require('../pc-spotify/SpotifyPlayer.js');
} catch (e) {
  SpotifyPlayer = null;
}

//* Export
module.exports = class Lyrics extends Plugin {
  startPlugin () {
    this.registerCommand(
      'lyrics',
      [],
      'Send lyrics to a specific song or the current song in chat!',
      'lyrics <song || ???>',
      async ([ args ]) => {
        try {
          // Get data...
          let data;
          if (SpotifyPlayer) {
            data = await get(`https://lyrics-api.powercord.dev/lyrics?input=${args || SpotifyPlayer.player.item.name + SpotifyPlayer.player.item.artists[0].name}`).then(res => JSON.parse(res.body));
          } else {
            data = await get(`https://lyrics-api.powercord.dev/lyrics?input=${args}`).then(res => JSON.parse(res.body));
          }
          if (!data.data[0].lyrics) {
            return {
              send: false,
              result: 'I couldn\'t find that song!'
            };
          }
          data = `${data.data[0].artist} - ${data.data[0].name}\n\n${data.data[0].lyrics}\n\nLyrics provided by KSoft.Si | © ${data.data[0].artist} ${data.data[0].album_year}`;
          const value = data.replace(/(?:\\[rn])+/g, '');
          // ...then send it
          if (value.length > 2000) { // Post link in chat if the lyrics are over 2000 characters
            return messages.sendMessage(
              channels.getChannelId(),
              { content: data.data[0].url }
            );
          }
          messages.sendMessage(
            channels.getChannelId(),
            { content: `\`\`\`${value}\`\`\`` }
          );
        } catch (e) {
          console.log(e);
          return {
            send: false,
            result: 'Yikes, I couldn\'t find that song due to an error. Please check the Discord developer tools console! (Ctrl + Shift + I)'
          };
        }
      });
  }
};
