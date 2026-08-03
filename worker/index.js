export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/register" && request.method === "POST") {
      return handleRegister(request, env);
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/registrations" && request.method === "POST") {
      return handleCreateRegistration(request, env);
    }

    if (url.pathname === "/api/registrations" && request.method === "GET") {
      return handleGetRegistrations(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function handleRegister(request, env) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);

  try {
    await env.DB.prepare(
      `INSERT INTO users
        (email, password_hash, first_name, last_name, birthdate, gender, shirt_size,
         house_no, moo, soi, road, sub_district, district, province, postal_code, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.email,
        passwordHash,
        body.firstName,
        body.lastName,
        body.birthdate,
        body.gender,
        body.shirtSize,
        body.houseNo,
        body.moo,
        body.soi,
        body.road,
        body.subDistrict,
        body.district,
        body.province,
        body.postalCode,
        body.phone
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
      { status: 400 }
    );
  }
}

async function handleLogin(request, env) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);

  const user = await env.DB.prepare(
    "SELECT id, email, first_name FROM users WHERE email = ? AND password_hash = ?"
  )
    .bind(body.email, passwordHash)
    .first();

  if (!user) {
    return Response.json(
      { success: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  return Response.json({ success: true, user });
}

async function handleCreateRegistration(request, env) {
  const body = await request.json();

  if (!body.userId || !body.eventId || !body.packageId) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO registrations
        (user_id, event_id, package_id, event_title, package_name, price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`
    )
      .bind(
        body.userId,
        body.eventId,
        body.packageId,
        body.eventTitle,
        body.packageName,
        body.price
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetRegistrations(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const { results } = await env.DB.prepare(
    "SELECT * FROM registrations WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(userId)
    .all();

  return Response.json({ success: true, registrations: results });
}
