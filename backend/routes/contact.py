from flask import Blueprint, request, jsonify
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

contact_bp = Blueprint("contact", __name__)

@contact_bp.route("/", methods=["POST"])
def send_contact():
    """
    Handle contact form submissions.
    Requires environment variables:
    - CONTACT_EMAIL: Your email to receive messages
    - SMTP_SERVER: SMTP server (e.g., smtp.gmail.com)
    - SMTP_PORT: SMTP port (e.g., 587)
    - SMTP_USER: SMTP username (usually your email)
    - SMTP_PASS: SMTP password or app password
    """
    data = request.json
    
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()
    
    # Basic validation
    if not name or not email or not message:
        return jsonify({"error": "All fields are required"}), 400
    
    if "@" not in email:
        return jsonify({"error": "Invalid email address"}), 400
    
    # Simple honeypot spam protection (you can add more)
    if len(message) > 5000:
        return jsonify({"error": "Message too long"}), 400
    
    try:
        # Get email configuration from environment
        contact_email = os.getenv("CONTACT_EMAIL")
        smtp_server = os.getenv("SMTP_SERVER")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        
        if not all([contact_email, smtp_server, smtp_user, smtp_pass]):
            # If email not configured, just log or save to file
            # For now, return success but log it
            print(f"Contact form submission: {name} ({email}): {message}")
            return jsonify({"success": True, "message": "Message received (not configured for email)"})
        
        # Create email
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = contact_email
        msg['Subject'] = f"Contact Form: Message from {name}"
        
        body = f"""
        New contact form submission from Greanium OS:
        
        Name: {name}
        Email: {email}
        
        Message:
        {message}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        
        return jsonify({"success": True, "message": "Message sent successfully"})
        
    except Exception as e:
        print(f"Error sending contact email: {e}")
        return jsonify({"error": "Failed to send message. Please try again later."}), 500

