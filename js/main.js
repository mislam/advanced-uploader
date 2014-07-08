;(function (window, $) {

	'use strict';

	var

		Uploader = window.Uploader,

		uploader = new Uploader({
			url: '/php/upload.php',
			browseButton: 'browse-button'
		});

	uploader
		.on('noflash', function () {
			alert('Flash player not installed!');
		})
		.on('start', function () {
			$('#upload-status').text('Uploading...');
			$('#progressbar').find('span').css('width', '0').removeClass('complete');
		})
		.on('progress', function (o) {
			var percentUploaded = o.uploadedBytes / o.totalBytes * 100;
			$('#progressbar').find('span').css('width', percentUploaded + '%');
		})
		.on('complete', function () {
			$('#upload-status').text('Upload Complete');
			$('#progressbar').find('span').css('width', '100%').addClass('complete');
		});

	$('#upload-button').on('click', function () {
		uploader.upload();
	});

	uploader.initialize();

}(this, this.jQuery));
