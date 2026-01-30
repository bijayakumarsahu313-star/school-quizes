'use client';

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Loader2, Check } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isSent) return;

    setIsSubmitting(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSent(true);
    setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form

    setTimeout(() => {
      setIsSent(false);
    }, 3000); // Revert button state after 3 seconds
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-headline">Get in Touch</h1>
            <p className="text-lg text-muted-foreground mt-2">
              We'd love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-primary" />
                  <span>bisweswarsahu834@gmail.com</span>
                </p>
                <p className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-primary" />
                  <span>8770779458</span>
                </p>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your Message" value={formData.message} onChange={handleChange} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || isSent}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : isSent ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Message Sent!
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
