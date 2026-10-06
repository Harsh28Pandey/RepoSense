import React, { useState } from 'react';
import API from '../api/client';
import toast from 'react-hot-toast';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

export default function ContactPage() {
  usePageTitle('Contact Support', 'Have questions or feedback? Send us a message.');

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please complete all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/contact', formData);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error('Failed to submit message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-[#EEF1F5] text-[#1F2A37]">
      <main className="max-w-xl mx-auto px-6">
        <div className="text-center space-y-3 mb-10">
          <span className="px-3 py-1 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#2F6FDE] text-xs font-semibold">
            Get In Touch
          </span>
          <h1 className="text-2xl font-extrabold text-[#1F2A37]">Contact RepoSense Support</h1>
          <p className="text-xs text-[#5B6778]">Have questions or feedback? Send us a message.</p>
        </div>

        <div className="p-8 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] shadow-xs">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#DDEEE4] text-[#2E8B57] border border-[#2E8B57]/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1F2A37]">Message Received!</h3>
              <p className="text-xs text-[#5B6778]">Thank you for reaching out. We will respond to <span className="font-semibold text-[#1F2A37]">{formData.email}</span> shortly.</p>
              <Button
                variant="secondary"
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Harsh Pandey"
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="harsh.dev@example.com"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1F2A37]">Message</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 rounded-2xl bg-[#E8ECF1] border border-[#D3D9E2] text-[#1F2A37] text-xs placeholder-[#8B96A5] focus:bg-[#FAFBFC] focus:border-[#2F6FDE] focus:outline-none resize-none"
                />
              </div>

              <Button
                type="submit"
                loading={submitting}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" /> Send Message
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
