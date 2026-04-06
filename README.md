# GYM AESTHETICS FITNESS — Instrucciones de instalación

## Archivos del sistema
```
gym-aesthetics/
├── index.html          ← Login
├── dashboard.html      ← Panel + semáforo
├── members.html        ← Gestión de socios
├── payments.html       ← Registro de pagos
├── reports.html        ← Reportes financieros (solo dueño)
├── settings.html       ← Configuración (solo dueño)
└── js/
    ├── config.js       ← Credenciales Supabase
    ├── auth.js         ← Sesión y roles
    ├── app.js          ← Utilidades compartidas
    └── styles.css      ← Estilos globales
```

---

## PASO 1 — Ya completado ✅
- Proyecto Supabase creado
- SQL ejecutado
- Usuario dueño creado en Auth
- Perfil insertado en tabla profiles

---

## PASO 2 — Edge Functions (para crear usuarios y notificaciones)

### 2a. Instala Supabase CLI
```bash
npm install -g supabase
supabase login
supabase init
supabase link --project-ref oockppjvrlbfffxurigq
```

### 2b. Crea la Edge Function para crear usuarios
```bash
supabase functions new create-user
```

Pega este código en `supabase/functions/create-user/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { email, password, full_name, role } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (userError) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 400 })
  }

  await supabaseAdmin.from('profiles').insert({
    id: userData.user.id,
    full_name,
    role
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2c. Crea la Edge Function para notificaciones (Resend)
```bash
supabase functions new send-notification
```

Pega este código en `supabase/functions/send-notification/index.ts`:

```typescript
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
```

### 2d. Crea la Edge Function para eliminar usuarios
```bash
supabase functions new delete-user
```

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  await supabaseAdmin.auth.admin.deleteUser(userId)
  await supabaseAdmin.from('profiles').delete().eq('id', userId)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2e. Configura los secretos
```bash
supabase secrets set RESEND_API_KEY=tu_resend_api_key
```

### 2f. Despliega las funciones
```bash
supabase functions deploy create-user
supabase functions deploy send-notification
supabase functions deploy delete-user
```

---

## PASO 3 — Cuenta Resend (gratis)
1. Ve a https://resend.com y crea cuenta gratis
2. Ve a API Keys → Create API Key
3. Copia la key y úsala en el paso 2e

---

## PASO 4 — Deploy del frontend (Netlify gratis)
1. Ve a https://netlify.com
2. Crea cuenta gratis
3. Arrastra la carpeta `gym-aesthetics` al panel de Netlify
4. ¡Listo! Te da una URL pública

---

## Acceso al sistema
- URL: la que te da Netlify
- Email: gym@bolivia.com
- Contraseña: la que guardaste

---

## Próximamente (Fase 2)
- QR único por socio
- Escáner de entrada con cámara
