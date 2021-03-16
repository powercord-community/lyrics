const { get } = require('powercord/http');
const { Plugin } = require('powercord/entities');
const { spotifySocket } = require('powercord/webpack');

module.exports = class Lyrics extends Plugin {

    startPlugin() {
        powercord.api.commands.registerCommand({
            command: 'lyrics',
            aliases: ['l'],
            description: 'Get lyrics to a specific song or the current song.',
            usage: '{c} [song]',
            executor: this.searchLyrics.bind(this)
        });
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand('lyrics');
    }

    async searchLyrics(args) {
        // the base URL for searching lyrics
        const base = 'https://lyrics-api.powercord.dev/lyrics?input=';

        try {
            // thanks to Harley for this!
            const playingOnSpotify = spotifySocket.getTrack();

            // check if there is something playing on Spotify.
            // if there is, and no args have been provided, assign that
            // track's name + artist to ``args``
            if (playingOnSpotify && !args[0]) {
                args = playingOnSpotify.artists[0].name + " " + playingOnSpotify.name;
            }

            // there was nothing playing, and no args were provided
            if (!args[0]) {
                return {
                    send: false,
                    result: "I couldn't detect a Spotify status, and you didn't " +
                            'provide a song to search for!'
                };
            }

            // the response body as JSON
            const data = await get(base + args).then(res => JSON.parse(res.body));

            // response had no ``data`` key, which means the query returned nothing
            if (!data.data) {
                return {
                    send: false,
                    result: "I couldn't find that song!"
                };
            }

            let lyrics;

            // if the lyrics are more than 2000 characters, the embed's description
            // will simply be a hyperlink to the lyrics
            if (data.data[0].lyrics.length > 2000) {
                lyrics = `[Click Here](${data.data[0].url})`;
            } else {
                // not sure why this regex is here but yes
                lyrics = data.data[0].lyrics.replace(/(?:\\[rn])+/g, '');
            }

            // builds the embed with our data
            const embed = {
                type: 'rich',
                title: `${data.data[0].artist} - ${data.data[0].name}`,
                color: 0x209cee,
                description: lyrics,
                footer: {
                    text: `Lyrics provided by KSoft.Si | © ${data.data[0].artist} ${data.data[0].album_year}`
                }
            };

            return {
                send: false,
                result: embed
            };

        } catch (e) {
            console.error('Error with lyrics plugin:', e);
            return {
                send: false,
                result: 'Yikes, something broke. Please check the Dev Console for info.'
            };
        }
    }
};
