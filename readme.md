# Advanced Uploader

Uploading a file via XMLHttpRequest with a real a progress bar is sometimes very painful and laborious job specially while facing cross-browser issues. On top of that, if someone is uploading a huge video file (i.e. 1GB) it causes the browser choke to death.

Keeping all these in mind, I decided to create an advanced uploader that will overcome these issues by:

- Instead of uploading the whole file at a time, send small pieces or blob.
- For careless dinosaur browsers (i.e. Internet Explorer 9 and below), use Flash transport to progressively upload chunks of bytes.
- On server side, assemble the file by placing the chunks together.


## Benefits

- Cross-browser compatibility.
- Rescue the browser from choking/freezing.
- Requires much less memory on server-side.
- Real progress bar.


## Supported Browsers

- Chrome
- Firefox
- Safari
- Opera
- Internet Explorer 9 and above


## Server Side Processing

Although the server-side script is written in PHP, it can be easily transported into other languages.

For simplicity's sake, I will show how to run the PHP code as a stand-alone server. If you're running PHP 5.4 and above, you will be able to run PHP's built in HTTP server with the following command:

	php -S localhost:8080 -t .

Now, browse to `http://localhost:8080/` to see the uploader in action.