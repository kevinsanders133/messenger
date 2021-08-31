<?php 

$name = $_GET["name"];
//$surname = $_POST["surname"];
//$father = $_POST["father"];
//$tel = $_POST["tel"];
//$email = $_POST["email"];
//$service = $_POST["service"];

echo $name;

$to      = 'storytelltom@gmail.com';
$subject = 'the subject';
$message = 'hello';
$headers = 'From: webmaster@example.com' . "\r\n" .
           'Reply-To: webmaster@example.com' . "\r\n" .
           'X-Mailer: PHP/' . phpversion();

//mail($to, $subject, $message, $headers);

?>