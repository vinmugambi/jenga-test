<?php
$plainText  = "KE1100161720541"; // See separate instruction on how to create this concatenation
$privateKey = openssl_pkey_get_private(("file://privatekey.pem"));
$token      = "QNg9X7cLJSpZVOpaJJ33wX0AbcRF";

openssl_sign($plainText, $signature, $privateKey, OPENSSL_ALGO_SHA256);

echo(base64_encode($signature));