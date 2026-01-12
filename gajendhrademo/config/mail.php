<?php
// Sample Gmail SMTP Configuration
// Copy this file to mail.php and update with your credentials

$mail_config = [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'aakash.a4iru5a@gmail.com', // Replace with your Gmail address
    'password' => 'eena esbt rimu litq', // Replace with your Gmail app password
    'from_email' => 'aakash.a4iru5a@gmail.com', // Replace with your Gmail address
    'from_name' => 'Narpavai Honey',
    'encryption' => 'tls'
];

// PHPMailer Configuration
require_once __DIR__ . '/../vendor/autoload.php'; // Make sure PHPMailer is installed via Composer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function createMailer() {
    global $mail_config;
    
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = $mail_config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $mail_config['username'];
        $mail->Password = $mail_config['password'];
        $mail->SMTPSecure = $mail_config['encryption'];
        $mail->Port = $mail_config['port'];
        
        // Default settings
        $mail->setFrom($mail_config['from_email'], $mail_config['from_name']);
        $mail->isHTML(true);
        
        return $mail;
    } catch (Exception $e) {
        throw new Exception("Mailer Error: " . $mail->ErrorInfo);
    }
}
?> 