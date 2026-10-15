# Audio folder

Drop your music files here, then point the player at them.

The tracks live in `index.html` inside the `#audio-list` element:

```html
<li class="audio__track" data-audio="assets/audio/no-handouts.mp3">
```

To add or rename a track:

1. Put the file in this folder (recommended: `128–192 kbps` MP3, keeps the site fast).
2. Update the matching `data-audio="..."` path in `index.html`.
3. Update the title and genre text in `.audio__meta`.

The player uses one shared `<audio>` element, so only one track plays at a time.
If a file is missing, that track shows "Audio coming soon" instead of breaking.
