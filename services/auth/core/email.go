package core

import (
	"auth/config"
	"strings"

	"gopkg.in/gomail.v2"
)

/**
 * Send an email using the provided SMTP client.
 */
func SendEmail(
	message string, email string, subject string, config config.Config, client *gomail.Dialer) error {
	mail := gomail.NewMessage()
	mail.SetHeader("From", config.SMTP_FROM)
	mail.SetHeader("To", email)
	mail.SetHeader("Subject", subject)
	mail.SetBody("text/html", message)

	if err := client.DialAndSend(mail); err != nil {
		return err
	}
	return nil
}

/**
 * Initialise the email service.
 */
func InitialiseEmailService(config config.Config) *gomail.Dialer {
	return gomail.NewDialer(config.SMTP_HOST, config.SMTP_PORT, config.SMTP_USER, config.SMTP_PASSWORD)
}

/**
 * Construct a verification email to send to the user.
 */
func ConstructVerificationEmail(verificationLink string, config config.Config) string {
	htmlTemplate := `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Email Verification</title>
  <style>
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #000000;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
    }
    .button:hover {
      background-color: #333333;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      color: #333333;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
		.button, .button:visited, .button:active {
			color: #ffffff !important;
			text-decoration: none;
		}
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email Address for OpenJudge</h2>
    <p>Thanks for signing up! Please verify your email by clicking the button below:</p>
    <p>
      <a href="{{verification_link}}" class="button">Verify Email</a>
    </p>
    <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
    <p><a href="{{verification_link}}">{{verification_link}}</a></p>
    <p>Cheers,<br />The OpenJudge Team</p>
  </div>
</body>
</html>
`
	return strings.ReplaceAll(htmlTemplate, "{{verification_link}}", verificationLink)
}


/**
 * Construct a reset password email to send to the user.
 */
func ConstructResetEmail(resetLink string, config config.Config) string {
	htmlTemplate := `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Password Reset</title>
  <style>
    .button {
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      color: #ffffff;
      background-color: #000000;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
    }
    .button:hover {
      background-color: #333333;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      color: #333333;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
		.button, .button:visited, .button:active {
			color: #ffffff !important;
			text-decoration: none;
		}
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password for OpenJudge</h2>
    <p>We received a request to reset your password. Please click the button below to reset it:</p>
    <p>
      <a href="{{reset_link}}" class="button">Reset Password</a>
    </p>
    <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
    <p><a href="{{reset_link}}">{{reset_link}}</a></p>
		<p>If you didn't request a password reset, please ignore this email.</p>
    <p>Cheers,<br />The OpenJudge Team</p>
  </div>
</body>
</html>
`
	return strings.ReplaceAll(htmlTemplate, "{{reset_link}}", resetLink)
}
