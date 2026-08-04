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

    if (url.pathname === "/api/registrations/pay" && request.method === "POST") {
      return handlePayRegistration(request, env);
    }

    if (url.pathname === "/api/users" && request.method === "GET") {
      return handleGetUser(request, env);
    }

    if (url.pathname === "/api/users" && request.method === "PUT") {
      return handleUpdateUser(request, env);
    }

    if (url.pathname === "/api/admin/pending" && request.method === "GET") {
      return handleGetPendingRegistrations(request, env);
    }

    if (url.pathname === "/api/admin/review" && request.method === "POST") {
      return handleReviewRegistration(request, env);
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

async function isAdmin(env, userId) {
  const user = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?")
    .bind(userId)
    .first();
  return !!(user && user.is_admin === 1);
}

async function fileToBase64DataUrl(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${file.type};base64,${base64}`;
}

async function handleRegister(request, env) {
  const body = await request.json();
  const passwordHash = await hashPassword(body.password);

  const existing = await env.DB.prepare(
    "SELECT id FROM users WHERE username = ?"
  )
    .bind(body.username)
    .first();

  if (existing) {
    return Response.json(
      { success: false, error: "User ID นี้ถูกใช้งานแล้ว" },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO users
        (username, email, password_hash, first_name, last_name, birthdate, gender, shirt_size,
         house_no, moo, soi, road, sub_district, district, province, postal_code, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.username,
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
    "SELECT id, email, first_name, is_admin FROM users WHERE username = ? AND password_hash = ?"
  )
    .bind(body.username, passwordHash)
    .first();

  if (!user) {
    return Response.json(
      { success: false, error: "User ID หรือรหัสผ่านไม่ถูกต้อง" },
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
    "SELECT id, user_id, event_id, package_id, status, created_at, event_title, package_name, price, paid_amount, slip_image FROM registrations WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(userId)
    .all();

  return Response.json({ success: true, registrations: results });
}

async function handlePayRegistration(request, env) {
  const formData = await request.formData();

  const registrationId = formData.get("registrationId");
  const amount = Number(formData.get("amount"));
  const file = formData.get("slip");
  const verifiedByOcr = formData.get("verifiedByOcr") === "true";

  if (!registrationId || !amount || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบสลิปและกรอกยอดเงิน" },
      { status: 400 }
    );
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { success: false, error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP) เท่านั้น" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return Response.json(
      { success: false, error: "ไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 2MB)" },
      { status: 400 }
    );
  }

  const reg = await env.DB.prepare(
    "SELECT * FROM registrations WHERE id = ?"
  )
    .bind(registrationId)
    .first();

  if (!reg) {
    return Response.json(
      { success: false, error: "ไม่พบรายการลงทะเบียนนี้" },
      { status: 404 }
    );
  }

  if (reg.status === "paid") {
    return Response.json(
      { success: false, error: "รายการนี้ชำระเงินแล้ว" },
      { status: 400 }
    );
  }

  if (amount < reg.price) {
    return Response.json(
      { success: false, error: `ยอดชำระต้องไม่ต่ำกว่า ${reg.price.toLocaleString()} บาท` },
      { status: 400 }
    );
  }

  const newStatus = verifiedByOcr ? "paid" : "pending_verification";
  const slipDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "UPDATE registrations SET status = ?, paid_amount = ?, slip_image = ? WHERE id = ?"
    )
      .bind(newStatus, amount, slipDataUrl, registrationId)
      .run();

    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetUser(request, env) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  const user = await env.DB.prepare(
    `SELECT id, username, email, first_name, last_name, birthdate, gender, shirt_size,
            house_no, moo, soi, road, sub_district, district, province, postal_code, phone, is_admin
     FROM users WHERE id = ?`
  )
    .bind(userId)
    .first();

  if (!user) {
    return Response.json({ success: false, error: "ไม่พบผู้ใช้" }, { status: 404 });
  }

  return Response.json({ success: true, user });
}

async function handleUpdateUser(request, env) {
  const body = await request.json();

  if (!body.userId) {
    return Response.json({ success: false, error: "ไม่พบ userId" }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      `UPDATE users SET
        first_name = ?, last_name = ?, birthdate = ?, gender = ?, shirt_size = ?,
        house_no = ?, moo = ?, soi = ?, road = ?, sub_district = ?, district = ?,
        province = ?, postal_code = ?, phone = ?
       WHERE id = ?`
    )
      .bind(
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
        body.phone,
        body.userId
      )
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "แก้ไขข้อมูลไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetPendingRegistrations(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const { results } = await env.DB.prepare(
    `SELECT r.*, u.email AS user_email, u.first_name AS user_first_name, u.last_name AS user_last_name
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.status = 'pending_verification'
     ORDER BY r.created_at ASC`
  ).all();

  return Response.json({ success: true, registrations: results });
}

async function handleReviewRegistration(request, env) {
  const body = await request.json();
  const { adminUserId, registrationId, action } = body;

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  if (!registrationId || !["approve", "reject"].includes(action)) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน" },
      { status: 400 }
    );
  }

  try {
    if (action === "approve") {
      // อนุมัติแล้ว -> ลบรูปสลิปทิ้ง ไม่ต้องเก็บต่อ
      await env.DB.prepare(
        "UPDATE registrations SET status = 'paid', slip_image = NULL WHERE id = ?"
      )
        .bind(registrationId)
        .run();
    } else {
      // ปฏิเสธ -> กลับไปสถานะ confirmed ให้ผู้ใช้แนบสลิปใหม่ (ไม่แตะรูปเดิม)
      await env.DB.prepare(
        "UPDATE registrations SET status = 'confirmed' WHERE id = ?"
      )
        .bind(registrationId)
        .run();
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
