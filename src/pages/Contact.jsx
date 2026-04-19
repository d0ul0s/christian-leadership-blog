import { useState } from 'react';
import SEO from '../components/SEO';
import './Contact.css';

const Contact = () => {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    const formData = new FormData(e.target);
    // Prepare the object for our custom backend
    const dataObj = Object.fromEntries(formData.entries());
    try {
      // 1. Send data to our custom backend (which saves to DB and sends the email)
      const dbResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataObj)
      });

      const dbData = await dbResponse.json();

      if (dbData.success) {
        setStatus("Message sent successfully! We will get back to you soon.");
        e.target.reset();
      } else {
        console.error("Backend Error:", dbData);
        setStatus("Failed to send message: " + (dbData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred while sending the message.");
    }
  };

  return (
    <div className="contact-page animate-fade-in">
      <SEO title="Contact" description="Reach out to Nathan." />
      <div className="container">
        <div className="contact-header delay-100">
          <h1 className="hero-title text-gradient">Get In Touch</h1>
          <p className="hero-subtitle">I'd love to hear from you. Feel free to reach out with questions, management discussions, or just to say hi.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-form-wrapper delay-300">
            <form className="glass-panel contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" className="form-control" placeholder="Nathan Rockwell" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" className="form-control" placeholder="nathan@example.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" className="form-control" placeholder="Speaking Inquiry" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" className="form-control" rows="5" placeholder="How can we help you?" required></textarea>
              </div>

              <button type="submit" className="btn-primary form-submit" disabled={status === "Sending..."}>
                {status === "Sending..." ? "Sending..." : "Send Message"}
              </button>

              {status && (
                <p className={`form-status ${status.includes("successfully") ? "success" : "error"}`} style={{ marginTop: '15px', textAlign: 'center' }}>
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
