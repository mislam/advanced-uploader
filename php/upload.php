<?php

define('UPLOAD_DIR', dirname(dirname(__FILE__)) . '/uploads');

receiveFile();

function receiveFile()
{
	if (array_key_exists('HTTP_X_FILE_NAME', $_SERVER)) {
		$fileName = $_SERVER['HTTP_X_FILE_NAME'];
	} else {
		$fileName = microTimestamp() . '.' . $_SERVER['HTTP_X_FILE_EXTENSION'];
	}

	// create upload directory if doesn't exist
	if (!is_dir(UPLOAD_DIR)) {
		mkdir(UPLOAD_DIR);
	}

	$outFilePath = UPLOAD_DIR . "/{$fileName}";

	// if file doesn't exist, create it and change its permission
	if (!file_exists($outFilePath)) {
		touch($outFilePath);
		chmod($outFilePath, 0777);
	}

	$content = file_get_contents('php://input');

	$fh = fopen($outFilePath, 'ab');
	fwrite($fh, $content);
	fclose($fh);

	header('Content-Type: application/json');
	echo json_encode(array('filename' => $fileName));
}

function microTimestamp()
{
	$seconds = microtime(true);
	return round($seconds * 1000);
}
