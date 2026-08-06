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

    if (url.pathname === "/api/registrations/result" && request.method === "POST") {
      return handleSubmitResult(request, env);
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

    if (url.pathname === "/api/admin/dashboard" && request.method === "GET") {
      return handleGetDashboard(request, env);
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
    "SELECT id, user_id, event_id, package_id, status, created_at, event_title, package_name, price, paid_amount, slip_image, result_image FROM registrations WHERE user_id = ? ORDER BY created_at DESC"
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
  const paidAt = verifiedByOcr ? new Date().toISOString() : null;

  try {
    await env.DB.prepare(
      "UPDATE registrations SET status = ?, paid_amount = ?, slip_image = ?, paid_at = COALESCE(?, paid_at) WHERE id = ?"
    )
      .bind(newStatus, amount, slipDataUrl, paidAt, registrationId)
      .run();

    return Response.json({ success: true, status: newStatus });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleSubmitResult(request, env) {
  const formData = await request.formData();

  const registrationId = formData.get("registrationId");
  const userId = formData.get("userId");
  const file = formData.get("resultImage");

  if (!registrationId || !userId || !file) {
    return Response.json(
      { success: false, error: "ข้อมูลไม่ครบถ้วน กรุณาแนบรูปผลกิจกรรม" },
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

  if (String(reg.user_id) !== String(userId)) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์ทำรายการนี้" },
      { status: 403 }
    );
  }

  if (reg.status !== "paid") {
    return Response.json(
      { success: false, error: "กิจกรรมนี้ยังไม่พร้อมให้ส่งผล" },
      { status: 400 }
    );
  }

  const resultDataUrl = await fileToBase64DataUrl(file);

  try {
    await env.DB.prepare(
      "UPDATE registrations SET status = 'result_pending', result_image = ? WHERE id = ?"
    )
      .bind(resultDataUrl, registrationId)
      .run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "ส่งผลกิจกรรมไม่สำเร็จ กรุณาลองใหม่" },
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
     WHERE r.status IN ('pending_verification', 'result_pending')
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

  const reg = await env.DB.prepare("SELECT status FROM registrations WHERE id = ?")
    .bind(registrationId)
    .first();

  if (!reg) {
    return Response.json(
      { success: false, error: "ไม่พบรายการลงทะเบียนนี้" },
      { status: 404 }
    );
  }

  try {
    if (reg.status === "pending_verification") {
      await env.DB.prepare(
        "INSERT INTO admin_reviews (registration_id, review_type, action) VALUES (?, 'payment', ?)"
      )
        .bind(registrationId, action)
        .run();

      if (action === "approve") {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'paid', slip_image = NULL, paid_at = datetime('now') WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      } else {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'confirmed' WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      }
    } else if (reg.status === "result_pending") {
      await env.DB.prepare(
        "INSERT INTO admin_reviews (registration_id, review_type, action) VALUES (?, 'result', ?)"
      )
        .bind(registrationId, action)
        .run();

      if (action === "approve") {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'completed', result_image = NULL WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      } else {
        await env.DB.prepare(
          "UPDATE registrations SET status = 'paid' WHERE id = ?"
        )
          .bind(registrationId)
          .run();
      }
    } else {
      return Response.json(
        { success: false, error: "รายการนี้ไม่ได้อยู่ในสถานะรอตรวจสอบ" },
        { status: 400 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}

async function handleGetDashboard(request, env) {
  const url = new URL(request.url);
  const adminUserId = url.searchParams.get("adminUserId");
  const period = url.searchParams.get("period") || "month";

  if (!adminUserId || !(await isAdmin(env, adminUserId))) {
    return Response.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึงส่วนนี้" },
      { status: 403 }
    );
  }

  const totalMembers = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first();

  const activeEventsCount = await env.DB.prepare(
    "SELECT COUNT(DISTINCT event_id) AS c FROM registrations"
  ).first();

  const todaySignups = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE date(created_at) = date('now')"
  ).first();

  const revenueQuery =
    period === "today"
      ? "SELECT COALESCE(SUM(paid_amount),0) AS s FROM registrations WHERE paid_at IS NOT NULL AND date(paid_at) = date('now')"
      : "SELECT COALESCE(SUM(paid_amount),0) AS s FROM registrations WHERE paid_at IS NOT NULL AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')";
  const revenue = await env.DB.prepare(revenueQuery).first();

  const pendingPayment = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status = 'confirmed'"
  ).first();

  const pendingSlip = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status = 'pending_verification'"
  ).first();

  const pendingResult = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM registrations WHERE status = 'result_pending'"
  ).first();

  const { results: weeklySignupsRaw } = await env.DB.prepare(
    `SELECT date(created_at) AS d, COUNT(*) AS c
     FROM registrations
     WHERE date(created_at) >= date('now', '-6 days')
     GROUP BY d
     ORDER BY d ASC`
  ).all();

  const { results: monthlyRevenueRaw } = await env.DB.prepare(
    `SELECT strftime('%m', paid_at) AS m, SUM(paid_amount) AS s
     FROM registrations
     WHERE paid_at IS NOT NULL AND strftime('%Y', paid_at) = strftime('%Y', 'now')
     GROUP BY m
     ORDER BY m ASC`
  ).all();

  const newMembersToday = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE date(created_at) = date('now')"
  ).first();

  const newMembersWeek = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE date(created_at) >= date('now', '-6 days')"
  ).first();

  const newMembersMonth = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM users WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
  ).first();

  const { results: activeEventsList } = await env.DB.prepare(
    `SELECT
       event_id AS id,
       event_title AS title,
       COUNT(*) AS signups,
       SUM(CASE WHEN status IN ('paid','result_pending','completed') THEN 1 ELSE 0 END) AS paid,
       SUM(CASE WHEN status IN ('result_pending','completed') THEN 1 ELSE 0 END) AS result
     FROM registrations
     GROUP BY event_id
     ORDER BY MAX(created_at) DESC`
  ).all();

  return Response.json({
    success: true,
    totalMembers: totalMembers.c,
    activeEvents: activeEventsCount.c,
    todaySignups: todaySignups.c,
    revenue: revenue.s,
    revenuePeriod: period,
    pendingPayment: pendingPayment.c,
    pendingSlip: pendingSlip.c,
    pendingResult: pendingResult.c,
    weeklySignups: weeklySignupsRaw,
    monthlyRevenue: monthlyRevenueRaw,
    newMembers: {
      today: newMembersToday.c,
      week: newMembersWeek.c,
      month: newMembersMonth.c,
    },
    activeEventsList,
  });
}
