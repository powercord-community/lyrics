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
        const base = 'https://some-random-api.ml/lyrics?title=';

        try {
            const playingOnSpotify = spotifySocket.getTrack(); // thanks to Harley for this!

            if (!args[0]) {
                // Check if there is something playing on Spotify.
                // If there is, assign that track's artist + name to ``args``
                if (playingOnSpotify) {
                    args = `${playingOnSpotify.artists[0].name} ${playingOnSpotify.name}`;
                } else {
                    return {
                        send: false,
                        result: 'Error: No Spotify status detected and no song to search for provided.'
                    };
                }
            }

            let data;
            await get(encodeURI(base + args)).then(res => data = res.body);

            if (!data || data.error) {
                return {
                    send: false,
                    result: 'Error: Song not found.'
                };
            }
            
            let { links, author, title, lyrics } = data;

            // If the lyrics are more than 2048 characters, the embed's description
            // will simply be a hyperlink to the lyrics
            if (lyrics.length > 2048) {
                lyrics = `[Click Here](${links.genius})`;
                links.genius = null;
            }

            const embed = {
                type: 'rich',
                author: {
                    name: author
                },
                url: links.genius,
                title: title,
                color: 0x209cee,
                description: lyrics,
                footer: {
                    icon_url: 'https://i.some-random-api.ml/logo.png',
                    text: `Lyrics provided by Some Random API | © ${author}`
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
                result: 'Error: Something broke. Please check the Developer Console for information.'
            };
        }
    }
};
