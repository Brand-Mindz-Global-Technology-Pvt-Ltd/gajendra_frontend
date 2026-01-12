<?php
require_once __DIR__ . '/../config/mail.php';

class AuthController {
    private $conn;

    public function __construct($dbConn) {
        $this->conn = $dbConn;
    }
    
    public function getUserProfile($user_id)
{
    try {
        $user_id = intval($user_id);
        if ($user_id <= 0) {
            return [
                'status' => 'error',
                'message' => 'Invalid user ID'
            ];
        }

        $query = "SELECT 
                    id,
                    name,
                    phone,
                    email,
                    dob,
                    gender,
                    profile_image
                  FROM users
                  WHERE id = ? LIMIT 1";

        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return [
                'status' => 'error',
                'message' => 'Failed to prepare statement'
            ];
        }

        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user) {
            return [
                'status' => 'error',
                'message' => 'User not found'
            ];
        }

        // Prevent null values
        $user['dob'] = $user['dob'] ?? '';
        $user['gender'] = $user['gender'] ?? '';
        $user['profile_image'] = $user['profile_image'] ?? '';

        return [
            'status' => 'success',
            'message' => 'Profile fetched successfully',
            'data' => $user
        ];

    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Server error: ' . $e->getMessage()
        ];
    }
}


public function updateUserProfile($data)
{
    try {
        $user_id = intval($data['user_id'] ?? 0);
        $name    = trim($data['name'] ?? '');
        $phone   = trim($data['phone'] ?? '');
        $email   = trim($data['email'] ?? '');
        $dob     = trim($data['dob'] ?? '');
        $gender  = trim($data['gender'] ?? '');
        $profile_image = trim($data['profile_image'] ?? '');

        if ($user_id <= 0) {
            return ['status' => 'error', 'message' => 'Invalid user ID'];
        }
        if (!$name || !$phone || !$email) {
            return ['status' => 'error', 'message' => 'Name, phone, and email are required'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['status' => 'error', 'message' => 'Invalid email format'];
        }
        if (!$this->validateIndianPhone($phone)) {
            return ['status' => 'error', 'message' => 'Enter a valid 10-digit Indian phone number'];
        }

        // Prepare update query
        $sql = "UPDATE users 
                SET name = ?, phone = ?, email = ?, dob = ?, gender = ?, profile_image = ?
                WHERE id = ?";

        $stmt = $this->conn->prepare($sql);

        if (!$stmt) {
            return ['status' => 'error', 'message' => 'Failed to prepare update statement'];
        }

        $stmt->bind_param("ssssssi", $name, $phone, $email, $dob, $gender, $profile_image, $user_id);

        if ($stmt->execute()) {
            return [
                'status'  => 'success',
                'message' => 'Profile updated successfully'
            ];
        } else {
            return [
                'status'  => 'error',
                'message' => 'Database execution failed'
            ];
        }

    } catch (Exception $e) {
        return [
            'status' => 'error',
            'message' => 'Server error: ' . $e->getMessage()
        ];
    }
}

public function getUserAddress($user_id)
{
    try {
        $user_id = intval($user_id);

        if ($user_id <= 0) {
            return ['status' => 'error', 'message' => 'Invalid user ID'];
        }

        $query = "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);

        if (!$stmt) {
            return ['status' => 'error', 'message' => 'Failed to prepare statement'];
        }

        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $address = $result->fetch_assoc();

        if (!$address) {
            return [
                'status' => 'success',
                'message' => 'No address found',
                'data' => null
            ];
        }

        return [
            'status' => 'success',
            'message' => 'Address fetched successfully',
            'data' => $address
        ];

    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
}

public function updateUserAddress($data)
{
    try {
        $user_id = intval($data['user_id'] ?? 0);
        $full_name = trim($data['full_name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $address_line1 = trim($data['address_line1'] ?? '');
        $address_line2 = trim($data['address_line2'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $pincode = trim($data['pincode'] ?? '');
        $country = trim($data['country'] ?? 'India');
        $landmark = trim($data['landmark'] ?? '');

        if ($user_id <= 0) return ['status' => 'error', 'message' => 'Invalid user ID'];
        if (!$full_name || !$phone || !$address_line1 || !$city || !$state || !$pincode) {
            return ['status' => 'error', 'message' => 'All required fields must be filled'];
        }

        // Does address already exist?
        $check = $this->conn->prepare("SELECT id FROM user_addresses WHERE user_id = ?");
        $check->bind_param("i", $user_id);
        $check->execute();
        $result = $check->get_result();

        if ($result->num_rows > 0) {
            // UPDATE existing address
            $sql = "UPDATE user_addresses SET
                        full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
                        city = ?, state = ?, pincode = ?, country = ?, landmark = ?
                    WHERE user_id = ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "sssssssssi",
                $full_name, $phone, $address_line1, $address_line2,
                $city, $state, $pincode, $country, $landmark, $user_id
            );

            if ($stmt->execute()) {
                return ['status' => 'success', 'message' => 'Address updated'];
            }

        } else {
            // INSERT new address
            $sql = "INSERT INTO user_addresses 
                    (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country, landmark)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "isssssssss",
                $user_id, $full_name, $phone, $address_line1, $address_line2,
                $city, $state, $pincode, $country, $landmark
            );

            if ($stmt->execute()) {
                return ['status' => 'success', 'message' => 'Address added'];
            }
        }

        return ['status' => 'error', 'message' => 'Failed to save address'];

    } catch (Exception $e) {
        return ['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()];
    }
}



    // --- Private Helper Functions ---

    private function validateIndianPhone($phone) {
        $phone = preg_replace('/[\s\-+]/', '', $phone);
        return preg_match('/^[6-9]\d{9}$/', $phone);
    }

    private function validatePassword($password) {
        if (strlen($password) < 8) return ['valid' => false, 'message' => 'Password must be at least 8 characters long'];
        if (!preg_match('/[A-Z]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one uppercase letter'];
        if (!preg_match('/[a-z]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one lowercase letter'];
        if (!preg_match('/[0-9]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one number'];
        if (!preg_match('/[@$!%*#?&]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one special character (@$!%*#?&)'];
        return ['valid' => true, 'message' => 'Password is valid'];
    }
    
    // <<< NEW HELPER FUNCTION: To generate, save, and send an OTP. This avoids code duplication.
    private function generateAndSendOTP($email, $name, $purpose) {
        // Use 4-digit for forgot, 6-digit for signup
        $otp = ($purpose === 'forgot') ? rand(1000, 9999) : rand(100000, 999999);
        $expires_at = date('Y-m-d H:i:s', strtotime('+120 seconds')); // 2 minute expiry

        // Delete any old OTPs for this exact purpose to prevent conflicts
        $del = $this->conn->prepare("DELETE FROM email_otps WHERE email = ? AND purpose = ?");
        $del->bind_param("ss", $email, $purpose);
        $del->execute();

        // Insert the new OTP
        $stmt = $this->conn->prepare("INSERT INTO email_otps (email, otp_code, expires_at, purpose) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $email, $otp, $expires_at, $purpose);

        if ($stmt->execute()) {
            try {
                $mail = createMailer();
                $mail->addAddress($email);

                if ($purpose === 'signup') {
                    $mail->Subject = "Your Indian Tribe Registration OTP";
                    $mail->Body = $this->getRegistrationOTPEmailTemplate($otp, $name);
                    $mail->AltBody = "Your OTP is: $otp. It will expire in 2 minutes.";
                } else { // 'forgot' purpose
                    $mail->Subject = "Your Password Reset OTP - Indian Tribe";
                    $mail->Body = $this->getForgotPasswordOTPEmailTemplate($otp, $name);
                    $mail->AltBody = "Your 4-digit OTP for password reset is: $otp. It will expire in 2 minutes.";
                }

                $mail->send();
                return ['status' => 'success', 'message' => 'An OTP has been sent to your email.'];
            } catch (Exception $e) {
                // In a real app, log this error instead of showing it to the user.
                error_log('Mailer Error: ' . $e->getMessage());
                return ['status' => 'error', 'message' => 'Could not send OTP email. Please try again later.'];
            }
        }
        return ['status' => 'error', 'message' => 'Database error while saving OTP.'];
    }

    // --- Public API Methods ---

    public function sendRegistrationOTP($data) {
        $name = $data['name'] ?? '';
        $phone = $data['phone'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $confirm_password = $data['confirm_password'] ?? '';
        $terms = $data['agreed_terms'] ?? 0;

        if (!$name || !$phone || !$email || !$password || !$confirm_password) {
            return ['status' => 'error', 'message' => 'All fields are required'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return ['status' => 'error', 'message' => 'Invalid email format'];
        if (!$this->validateIndianPhone($phone)) return ['status' => 'error', 'message' => 'Please enter a valid 10-digit Indian phone number'];
        if ($password !== $confirm_password) return ['status' => 'error', 'message' => 'Passwords do not match'];
        $password_validation = $this->validatePassword($password);
        if (!$password_validation['valid']) return ['status' => 'error', 'message' => $password_validation['message']];
        if (!$terms) return ['status' => 'error', 'message' => 'You must agree to the terms and conditions'];

        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            return ['status' => 'error', 'message' => 'This email address is already registered.'];
        }
        
        return $this->generateAndSendOTP($email, $name, 'signup');
    }
    
    public function verifyRegistrationOTP($data) {
        $email = $data['email'] ?? '';
        $otp = $data['otp'] ?? '';
        $name = $data['name'] ?? '';
        $phone = $data['phone'] ?? '';
        $password = $data['password'] ?? '';
        $confirm_password = $data['confirm_password'] ?? '';
        $terms = $data['agreed_terms'] ?? 0;

        if (!$email || !$otp || !$name || !$phone || !$password || !$confirm_password) {
            return ['status' => 'error', 'message' => 'All fields are required for verification.'];
        }

        $current_time = date('Y-m-d H:i:s');
        $stmt = $this->conn->prepare("SELECT * FROM email_otps WHERE email = ? AND otp_code = ? AND purpose = 'signup' AND expires_at > ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("sss", $email, $otp, $current_time);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $insert_stmt = $this->conn->prepare("INSERT INTO users (name, phone, email, password_hash, is_verified, agreed_terms) VALUES (?, ?, ?, ?, 1, ?)");
            $insert_stmt->bind_param("ssssi", $name, $phone, $email, $hashed, $terms);

            if ($insert_stmt->execute()) {
                $this->conn->query("DELETE FROM email_otps WHERE email = '$email' AND purpose = 'signup'");
                try {
                    $mail = createMailer();
                    $mail->addAddress($email);
                    $mail->Subject = "Welcome to Indian Tribe!";
                    $mail->Body = $this->getWelcomeEmailTemplate($name);
                    $mail->AltBody = "Welcome to Indian Tribe, $name! Your account has been successfully created.";
                    $mail->send();
                } catch (Exception $e) {
                    error_log("Welcome email failed: " . $e->getMessage());
                }
                $new_user_id = $insert_stmt->insert_id; // Get the ID of the new user
                return [
                    'status' => 'success',
                    'message' => 'Registration successful! Welcome to Indian Tribe.',
                    'user_id' => $new_user_id,
                    'user_email' => $email
                ];
            } else {
                return ['status' => 'error', 'message' => 'Registration failed. Please try again.'];
            }
        } else {
            return ['status' => 'error', 'message' => 'Invalid or expired OTP. Please try again.'];
        }
    }

    // <<< CRITICAL FIX: The resendOTP function is now simple and correct.
    public function resendOTP($data) {
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? ''; // Name is needed for the email template
        $purpose = $data['purpose'] ?? 'signup';

        // The only validation needed is for the email and name.
        if (!$email || !$name) {
            return ['status' => 'error', 'message' => 'Email and Name are required to resend an OTP.'];
        }
        
        // This no longer validates password, phone, etc. It just resends the code.
        return $this->generateAndSendOTP($email, $name, $purpose);
    }

    public function checkOTPExpiration($email, $purpose) {
         if (!$email) {
            return ['status' => 'error', 'message' => 'Email is required'];
        }

        $stmt = $this->conn->prepare("SELECT expires_at FROM email_otps WHERE email = ? AND purpose = ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("ss", $email, $purpose);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
             return ['status' => 'error', 'message' => 'No OTP found'];
        }

        $otpRecord = $result->fetch_assoc();
        $expiresAt = strtotime($otpRecord['expires_at']);
        
        if (time() > $expiresAt) {
             return ['status' => 'expired', 'message' => 'OTP has expired'];
        }
        
        return ['status' => 'valid', 'message' => 'OTP is valid'];
    }
    
    public function login($email, $password) {
        if (!$email || !$password) {
            return ['status' => 'error', 'message' => 'Email and password are required'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['status' => 'error', 'message' => 'Invalid email format'];
        }

        $stmt = $this->conn->prepare("SELECT id, name, password_hash FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password_hash'])) {
            return [
                'status' => 'success',
                'message' => 'Login successful',
                'user_id' => $user['id'],
                'user_name' => $user['name']
            ];
        } else {
            return ['status' => 'error', 'message' => 'Invalid email or password'];
        }
    }

    public function sendForgotPasswordOTP($email) {
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['status' => 'error', 'message' => 'A valid email is required.'];
        }

        $stmt = $this->conn->prepare("SELECT id, name FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user) {
            // To prevent user enumeration, we can send a generic message.
            return ['status' => 'success', 'message' => 'If an account with that email exists, a reset code has been sent.'];
        }

        return $this->generateAndSendOTP($email, $user['name'], 'forgot');
    }

    public function verifyForgotPasswordOTPOnly($email, $otp) {
        if (!$email || !$otp) {
            return ['status' => 'error', 'message' => 'Email and OTP are required'];
        }

        $current_time = date('Y-m-d H:i:s');
        $stmt = $this->conn->prepare("SELECT id FROM email_otps WHERE email = ? AND otp_code = ? AND purpose = 'forgot' AND expires_at > ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("sss", $email, $otp, $current_time);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            return ['status' => 'success', 'message' => 'OTP verified successfully!'];
        } else {
            return ['status' => 'error', 'message' => 'Invalid or expired OTP.'];
        }
    }

    public function resetPasswordAfterOTP($email, $new_password, $confirm_password) {
        if (!$email || !$new_password || !$confirm_password) {
            return ['status' => 'error', 'message' => 'All fields are required'];
        }
        if ($new_password !== $confirm_password) {
            return ['status' => 'error', 'message' => 'Passwords do not match'];
        }
        $password_validation = $this->validatePassword($new_password);
        if (!$password_validation['valid']) {
            return ['status' => 'error', 'message' => $password_validation['message']];
        }

        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $update_user = $this->conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        $update_user->bind_param("ss", $hashed_password, $email);
        
        if ($update_user->execute()) {
            $this->conn->query("DELETE FROM email_otps WHERE email = '$email' AND purpose = 'forgot'");
            return ['status' => 'success', 'message' => 'Password reset successful! You can now login.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to update password. Please try again.'];
        }
    }
    

    // Email template for registration OTP
    private function getRegistrationOTPEmailTemplate($otp, $name) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Registration OTP - Indian Tribe</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Registration OTP</h1>
                    <p>Indian Tribe - Complete Your Registration</p>
                </div>
                <div class='content'>
                    <h2>Hello $name!</h2>
                    <p>Thank you for choosing Indian Tribe! Please use the OTP below to complete your registration.</p>
                    
                    <div class='otp-box'>
                        <p><strong>Your Registration OTP:</strong></p>
                        <div class='otp-code'>$otp</div>
                        <p><small>This code will expire in 60 seconds</small></p>
                    </div>
                    
                    <div class='warning'>
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>Never share this OTP with anyone</li>
                            <li>Our team will never ask for your OTP</li>
                            <li>If you didn't request this, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>The Indian Tribe Team</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Indian Tribe. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    // Welcome email template
    private function getWelcomeEmailTemplate($name) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Welcome to Indian Tribe</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .welcome-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 Welcome to Indian Tribe!</h1>
                    <p>Your account has been successfully created</p>
                </div>
                <div class='content'>
                    <h2>Hello $name!</h2>
                    <p>Welcome to the Indian Tribe community! We're excited to have you on board.</p>
                    
                    <div class='welcome-box'>
                        <h3>🎯 What's Next?</h3>
                        <p>Your account is now active and ready to use. You can:</p>
                        <ul style='text-align: left;'>
                            <li>Complete your profile</li>
                            <li>Explore our community features</li>
                            <li>Connect with other members</li>
                            <li>Access exclusive content</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions or need assistance, our support team is here to help.</p>
                    
                    <p>Best regards,<br>The Indian Tribe Team</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2024 Indian Tribe. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    // Email template for forgot password OTP
    private function getForgotPasswordOTPEmailTemplate($otp, $name) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Password Reset OTP - Indian Tribe</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Password Reset OTP</h1>
                    <p>Indian Tribe - Secure Password Reset</p>
                </div>
                <div class='content'>
                    <h2>Hello $name!</h2>
                    <p>You have requested to reset your password for your Indian Tribe account.</p>
                    
                    <div class='otp-box'>
                        <p><strong>Your Password Reset OTP:</strong></p>
                        <div class='otp-code'>$otp</div>
                        <p><small>This code will expire in 60 seconds</small></p>
                    </div>
                    
                    <div class='warning'>
                        <strong>⚠️ Security Notice:</strong>
                        <ul>
                            <li>Never share this OTP with anyone</li>
                            <li>Our team will never ask for your OTP</li>
                            <li>If you didn't request this password reset, please ignore this email</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                    
                    <p>Best regards,<br>The Indian Tribe Team</p>
                </div>
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>&copy; 2024 Indian Tribe. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
