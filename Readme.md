My local version of https://nakarte.me site, for editing vector maps.
Fork of https://github.com/wladich/nakarte.

#### Introduction

I am using https://nakarte.me site for editing vector maps of mountain
regions: https://slazav.xyz/maps/hr.htm. During this process a map is
converted to a number of tracks (each object type is a track, each
object is a segment). Tracks are uploaded to nakarte, edited, and then
saved. Then some process is performed to update map objects from tracks
without loosing any information (for exaple, names of line objects do
not exists in tracks).

In this fork I'm changing some interface features to make this
process simplier for me. The first step is to load vector map directly
and assign fixed track colors and linewidths to each object type.

#### Modifications

* Vector maps (my home-made VMAP1 format) can be loaded directly as a
number of tracks. A hardcoded list of object types, track colors and
widths are used.

* Tracks can have arbitrary colors. Color selection in the interface
works only with a list of predefined colors, as before. Waypoints can
have only predefined colors. Non-standard colors can appear only when
track is loaded as a part of a vector map.

* Tracks can have arbitrary linewidth. Storage of linewidth information
is not implemented. Non-standard linewidths can appear only when track
is loaded as a part of a vector map.

#### Information from original Readme file

Source code of site http://nakarte.me (former http://nakarte.tk)

Install locally for development

```bash
git clone https://github.com/wladich/nakarte.git
cd nakarte
yarn
```

Create a dummy `secrets.js` file:
```bash
cp src/secrets.js.template src/secrets.js
```

Run dev server:
```bash
yarn start
```

Check code for errors:
```bash
yarn run lint
```

Some features require keys stored in src/secrets.js. 
In repository those keys are replaced with dummy ones.
    
Some of server side components:
https://github.com/wladich/westra_passes_for_nakarte
https://github.com/wladich/ElevationServer
