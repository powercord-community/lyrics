# lyrics
Lyrics plugin for Powercord, supports searching and the ``pc-spotify`` plugin! (Confirmed working at 2nd April 2022)

Currently contains a ``lyrics`` command which works like this: (replace ``.`` with your Powercord prefix)
* ``.lyrics`` - Returns lyrics of the currently playing song on Spotify.
* ``.lyrics the beatles her majesty`` - Searches for lyrics of given arguments and returns them.

The lyrics will be shown in an embed as a Clyde (Powercord) message.

Output for ``.lyrics the beatles her majesty`` looks like this:

![image](screenshot.png)

Privacy Notice: Lyrics are obtained via [Some Random API](https://some-random-api.ml/). In the future, to improve privacy, this may be replaced with a proxy accessing the service.

Credits: initial plugin by David, rewrite by spinfish.
