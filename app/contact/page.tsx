"use client";
import { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('https://formspree.io/f/your_form_id', form);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">Contact Us - FskSwap</h1>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="p-2 border rounded w-full" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="p-2 border rounded w-full" />
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Message" className="p-2 border rounded w-full" />
          <button type="submit" className="bg-yellow-500 text-white p-2 rounded">Send</button>
        </form>
      </div>
    </div>
  );
}
