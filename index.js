const { get }                = require('powercord/http');
const { Plugin }             = require('powercord/entities');
const SpotifyPlayer          = require('../pc-spotify/SpotifyPlayer.js');
const { messages, channels } = require('powercord/webpack');

module.exports = class Lyrics extends Plugin {
  startPlugin () {
    this.registerCommand(
      'lyrics',
      [],
      'Send lyrics to a specific song or the current song in chat!',
      'lyrics <song || ???>',
      async ([ args ]) => {
        try {
          let data = await get(`https://ksoft.derpyenterprises.org/lyrics?input=${args || SpotifyPlayer.player.item.name + SpotifyPlayer.player.item.artists[0].name}`).then(res => res.body);
          if (!data.data[0].lyrics) {
            return {
              send: false,
              result: 'Yikes, I couldn\'t find that song!'
            };
          }
          data = `${data.data[0].artist} - ${data.data[0].name}\n\n${data.data[0].lyrics}\n\nLyrics provided by KSoft.Si | © ${data.data[0].artist} ${data.data[0].album_year}`;
          const value = data.replace(/(?:\\[rn])+/g, '');
          if (value.length > 2000) {
            return {
              send: false,
              result: `\`\`\`${value}\`\`\``
            };
          }
          messages.sendMessage(
            channels.getChannelId(),
            { content: `\`\`\`${value}\`\`\`` }
          );
        } catch (e) {
          console.log(e);
          return {
            send: false,
            result: 'Yikes, I couldn\'t find that song due to an error. Please check the Discord developer tools console! (ctrl + shift + i)'
          };
        }
      });
  }
};
