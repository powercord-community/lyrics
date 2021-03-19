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

        const base = 'https://lyrics-api.powercord.dev/lyrics?input='; // the base URL for searching lyrics

        try {
            const playingOnSpotify = spotifySocket.getTrack(); // thanks to Harley for this!

            // no args were provided
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

            // The response body as JSON
            // Since it's destructured, instead of calling data.data[0] or data.data[0].length, we can now just call data[0] or data.length
            // Basically, we're only getting the data array from this await response
            const { data } = await get(encodeURI(base + args)).then(res => JSON.parse(res.body));

            // Response had no ``data`` key or data key was empty, which means the query returned nothing
            if (!data || !data.length) {
                return {
                    send: false,
                    result: 'Error: Song not found.'
                };
            }
            
            // Destructuring objects for better code readability 
            let { url, artist, name, album_year, lyrics } = data[0];

            // If the lyrics are more than 2048 characters, the embed's description
            // will simply be a hyperlink to the lyrics
            if (lyrics.length > 2048) {
                lyrics = `[Click Here](${url})`;
                url = null;
            }

            // Builds the embed with our data
            const embed = {
                type: 'rich',
                author: {
                    name: artist
                },
                url: url,
                title: name,
                color: 0x209cee,
                description: lyrics,
                footer: {
                    icon_url: 'https://cdn.ksoft.si/images/Logo128.png',
                    text: `Lyrics provided by KSoft.Si | © ${artist} ${album_year.split(',')[0]}` // avoid having 100 million different album years
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
