import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { to, memberName, endDate, daysRemaining, gymName } = await req.json()

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to,
      subject: `${gymName} — Tu membresía vence pronto`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0f0f1a;color:#f0f0f5;padding:32px;border-radius:8px">
          <h1 style="font-size:28px;color:#d4f53c;margin:0 0 8px">¡Renueva tu membresía!</h1>
          <p style="color:#8888aa;margin:0 0 24px">${gymName}</p>
          <p style="font-size:16px">Hola <strong>${memberName}</strong>,</p>
          <p style="color:#8888aa">Tu membresía vence el <strong style="color:#ffc53d">${formatDate(endDate)}</strong>.</p>
          ${daysRemaining > 0
            ? `<p style="color:#8888aa">Te quedan <strong style="color:#ffc53d">${daysRemaining} día(s)</strong>.</p>`
            : `<p style="color:#ff3d3d">Tu membresía ya ha vencido. ¡Renueva hoy!</p>`
          }
          <div style="margin:28px 0;padding:20px;background:#16162a;border-left:3px solid #d4f53c">
            <p style="margin:0;font-size:14px;color:#8888aa">Acércate al gimnasio o comunícate con nosotros para renovar tu membresía.</p>
          </div>
          <p style="font-size:12px;color:#44445a;margin-top:32px">${gymName} — Sistema de Gestión</p>
        </div>
      `
    })
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})