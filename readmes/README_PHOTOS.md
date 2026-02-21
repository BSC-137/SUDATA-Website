# Managing and Adding Photo Albums

Photo Albums can be easily added by any team member.

Firstly, photos must be numbered incrementally and stored in the `assets/albums/` directory. To rename all images to be incrmemental (01.jpg, 02.jpg, ...), run the `rename_inc.py` script and pass the album directory as a command-line argument. After a little bit (O(n) complexity where n=# of images), all images will be named accordingly.

Now, in the `photos.astro` file in the `pages/` directory, import the album as follows:
```js
const albumGlob = import.meta.glob("../assets/albums/albumName/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
});
```
This loads all the images in the directory (caching todo).

Next, add the album metadata to the `albums` array, for example:
```js
const albums = [
  {
    name: "INN 2025",
    date: "May 2025",
    images: loadAlbum(innGlob, "INN 2025"),
    link: "https://photos.app.goo.gl/sPAGscihAqiscHNU6"
  },
]
```
**Ensure to add the Google Photos album link (with SUDATA Tech account)** and uncheck the *Collaborate* option when you fetch the share link.

Thats it! The rest is handled via array iteration.
