import { Order, Driver } from '@/types/dispatcher';

/**
 * Standardize phone number for WhatsApp wa.me API:
 * 08123456789 -> 628123456789
 * +628123456789 -> 628123456789
 * 628123456789 -> 628123456789
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Build a structured, professional WhatsApp notification message for a driver task assignment.
 */
export function buildOrderWhatsAppMessage(order: Order, driverName?: string): string {
  const driverGreeting = driverName ? `Halo *${driverName}*,` : 'Halo Driver,';

  const dateInfo = order.startDate
    ? `${order.startDate}${order.endDate ? ` s/d ${order.endDate}` : ''}`
    : 'Hari ini';

  const lines = [
    `*PENUGASAN ORDER BARU - DISPATCHER LOGISTICS*`,
    ``,
    `${driverGreeting}`,
    `Anda telah ditugaskan untuk menangani order pengiriman berikut:`,
    ``,
    `*No. Order:* ${order.orderNumber}`,
    `*Customer:* ${order.customer}`,
    `*Jadwal Tugas:* ${dateInfo}`,
    `*Lokasi Pickup:* ${order.pickupLocation}`,
    `*Lokasi Dropoff:* ${order.dropoffLocation}`,
    `*Jenis Tugas:* ${order.taskType || '-'}`,
    `⚡ *Prioritas:* ${order.priority || 'Normal'}`,
  ];

  if (order.notes && order.notes.trim()) {
    lines.push(`📝 *Catatan / Instruksi:* ${order.notes.trim()}`);
  }

  lines.push(
    ``,
    `Mohon segera konfirmasi kesiapan Anda dan laksanakan tugas sesuai SOP.`,
    `Terima kasih & selamat bertugas! 🚛💨`
  );

  return lines.join('\n');
}

/**
 * Opens WhatsApp Web or App in a new tab with the pre-filled assignment message.
 * Returns true if successfully opened, false otherwise.
 */
export function openWhatsAppNotification(order: Order, driver?: Driver | null): boolean {
  const phoneRaw = driver?.phone || order.driverPhone;
  if (!phoneRaw) {
    alert('Nomor telepon driver tidak ditemukan. Pastikan profil driver memiliki nomor WhatsApp.');
    return false;
  }

  const phone = formatPhoneForWhatsApp(phoneRaw);
  if (!phone || phone.length < 9) {
    alert(`Nomor telepon driver (${phoneRaw}) tidak valid untuk format WhatsApp.`);
    return false;
  }

  const driverName = driver?.name || order.assignedDriverName || undefined;
  const message = buildOrderWhatsAppMessage(order, driverName);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Opens a direct WhatsApp chat window to a phone number
 */
export function openWhatsAppChat(phone: string, message?: string): void {
  const formatted = formatPhoneForWhatsApp(phone);
  if (!formatted) return;
  const url = message 
    ? `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${formatted}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
